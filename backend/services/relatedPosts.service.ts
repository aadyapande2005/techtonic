import qdrantService from "../recommendation_engine/vectors/qdrant.service.js";
import embeddingService from "../recommendation_engine/embeddings/embedding.service.js";
import { COLLECTIONS } from "../recommendation_engine/vectors/qdrant.collections.js";
import Post from "../models/posts.model.js";
import "../models/user.model.js";
import { RELATED_POSTS_CONFIG, getCacheTTLMs } from "../config/relatedPosts.config.js";
import { relatedPostsQueue } from "../queues/relatedPosts.queue.js";

/**
 * Triggers an idempotent background job to refresh related posts for a post.
 * Uses a deterministic BullMQ jobId so duplicate jobs are ignored while one is queued or active.
 */
export const triggerRelatedPostsRefresh = async (postId: string) => {
    try {
        const jobId = `refresh-related-${postId}`;
        await relatedPostsQueue.add(
            'related-posts',
            { postId: String(postId) },
            {
                jobId,
                removeOnComplete: true,
                removeOnFail: true
            }
        );
        console.log(`[RelatedPosts] Enqueued refresh job ${jobId}`);
    } catch (err) {
        console.error(`[RelatedPosts] Failed to enqueue refresh-related-posts for ${postId}:`, err);
    }
};

/**
 * Core refresh logic executed by the BullMQ worker.
 * 1. Checks cache freshness (idempotency safety).
 * 2. Retrieves the post's vector embedding from Qdrant (or generates & indexes it).
 * 3. Performs similarity search in Qdrant for candidates with a buffer pool.
 * 4. Excludes the current post and any unpublished/deleted posts or unavailable authors.
 * 5. Saves the top X post IDs and similarity scores back into Post along with updatedAt.
 */
export const refreshRelatedPostsForPost = async (postId: string) => {
    try {
        const post = await Post.findById(postId);
        if (!post || post.isAvailable === false) {
            console.log(`[RelatedPosts] Post ${postId} not found or unavailable`);
            return;
        }

        // Idempotency check: if cache was already refreshed recently and has posts, skip
        const updatedAt = post.relatedPosts?.updatedAt;
        if (updatedAt && post.relatedPosts?.posts && post.relatedPosts.posts.length > 0) {
            const age = Date.now() - new Date(updatedAt).getTime();
            if (age < getCacheTTLMs()) {
                console.log(`[RelatedPosts] Post ${postId} cache is still valid (${Math.round(age / 1000)}s old). Skipping.`);
                return;
            }
        }

        // 1. Retrieve the post's embedding from Qdrant
        let vector: number[] | null = null;
        let pointUuid = post.qdrantId;

        if (pointUuid) {
            try {
                const point = await qdrantService.retrieve(COLLECTIONS.POSTS, pointUuid);
                if (point && Array.isArray(point.vector)) {
                    vector = point.vector;
                }
            } catch (err) {
                console.warn(`[RelatedPosts] Failed to retrieve vector for point ${pointUuid}:`, err);
            }
        }

        // Fallback: If not in Qdrant yet, generate embedding and upsert
        if (!vector) {
            console.log(`[RelatedPosts] Generating embedding for post ${postId}...`);
            vector = await embeddingService.generatePostEmbedding(post);
            if (!pointUuid) {
                pointUuid = qdrantService.createId();
                await Post.findByIdAndUpdate(postId, { qdrantId: pointUuid });
            }
            await qdrantService.upsert(
                COLLECTIONS.POSTS,
                pointUuid,
                vector,
                {
                    id: post._id.toString(),
                    title: post.title,
                    summary: post.summary,
                    content: post.description,
                    topics: post.topics
                }
            );
        }

        // 2. Perform similarity search in Qdrant with candidate pool buffer
        const limit = RELATED_POSTS_CONFIG.LIMIT;
        const searchLimit = Math.max((limit + 1) * RELATED_POSTS_CONFIG.SEARCH_POOL_MULTIPLIER, RELATED_POSTS_CONFIG.SEARCH_POOL_MIN);

        const searchResults = await qdrantService.search(
            COLLECTIONS.POSTS,
            vector,
            searchLimit,
            undefined
        );

        // 3. Exclude the current post
        const currentPostIdStr = post._id.toString();
        const candidateResults = searchResults.filter((result) => {
            const payloadId = result.payload?.id ? String(result.payload.id) : null;
            const qdrantPointId = String(result.id);
            if (payloadId && payloadId === currentPostIdStr) return false;
            if (pointUuid && qdrantPointId === String(pointUuid)) return false;
            return true;
        });

        if (candidateResults.length === 0) {
            console.log(`[RelatedPosts] No similar candidates found for ${postId}`);
            await Post.findByIdAndUpdate(postId, {
                'relatedPosts.posts': [],
                'relatedPosts.updatedAt': new Date()
            });
            return;
        }

        // 4. Collect candidate IDs and query MongoDB to ensure posts & authors are available
        const candidateMongoIds = candidateResults
            .map(r => r.payload?.id)
            .filter(Boolean)
            .map(String);

        const candidateQdrantIds = candidateResults
            .map(r => String(r.id))
            .filter(Boolean);

        const dbPosts = await Post.find({
            $or: [
                { _id: { $in: candidateMongoIds } },
                { qdrantId: { $in: candidateQdrantIds } }
            ],
            _id: { $ne: post._id },
            isAvailable: { $ne: false }
        }).populate({
            path: 'author',
            select: 'username email isAvailable',
            match: { isAvailable: { $ne: false } }
        });

        // Filter out posts without valid authors
        const validDbPosts = dbPosts.filter(p => Boolean(p.author));

        const postByMongoId = new Map(validDbPosts.map(p => [p._id.toString(), p]));
        const postByQdrantId = new Map(validDbPosts.filter(p => p.qdrantId).map(p => [String(p.qdrantId), p]));

        // Select top X candidates preserving Qdrant similarity order
        const matchedPosts: { postId: any; score: number }[] = [];
        const seenPostIds = new Set<string>();

        for (const res of candidateResults) {
            const payloadId = res.payload?.id ? String(res.payload.id) : null;
            const qdrantId = String(res.id);

            const matched = (payloadId && postByMongoId.get(payloadId)) || postByQdrantId.get(qdrantId);
            if (matched) {
                const mId = matched._id.toString();
                if (!seenPostIds.has(mId)) {
                    seenPostIds.add(mId);
                    matchedPosts.push({
                        postId: matched._id,
                        score: Number(res.score.toFixed(4))
                    });
                }
            }

            if (matchedPosts.length >= limit) {
                break;
            }
        }

        // 5. Save the top X post IDs and scores back into Post document along with new updatedAt
        await Post.findByIdAndUpdate(postId, {
            'relatedPosts.posts': matchedPosts,
            'relatedPosts.updatedAt': new Date()
        });

        console.log(`[RelatedPosts] Successfully refreshed ${matchedPosts.length} related posts for ${postId}`);
    } catch (error) {
        console.error(`[RelatedPosts] Error refreshing related posts for ${postId}:`, error);
        throw error;
    }
};
