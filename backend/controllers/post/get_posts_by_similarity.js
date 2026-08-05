import embeddingService from "../../recommendation_engine/embeddings/embedding.service.js";
import qdrantService from "../../recommendation_engine/vectors/qdrant.service.js";
import { COLLECTIONS } from "../../recommendation_engine/vectors/qdrant.collections.js";
import Post from "../../models/posts.model.js";

// Minimum similarity threshold (50% = 0.5 cosine similarity)
const MIN_SIMILARITY_THRESHOLD = 0.3;

export const get_posts_by_similarity = async (req, res) => {
    try {
        // Get search query from URL path parameter
        const query = req.params.search_query;
        
        if (!query || typeof query !== 'string' || query.trim() === '') {
            return res.status(400).json({ 
                message: 'Search query parameter "search_query" is required' 
            });
        }

        // Get pagination parameters
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 20);
        const offset = (page - 1) * limit;

        // Generate embedding for the search query
        const queryEmbedding = await embeddingService.generateEmbedding(query.trim());

        // Search in Qdrant posts collection - get more results to account for filtering
        const searchResults = await qdrantService.search(
            COLLECTIONS.POSTS,
            queryEmbedding,
            50, // Get more results to filter by similarity threshold
            undefined // No filter for now
        );

        // Filter results by similarity score (cosine similarity >= 0.5)
        const filteredResults = searchResults.filter(result => result.score >= MIN_SIMILARITY_THRESHOLD);

        // Apply pagination to filtered results
        const paginatedResults = filteredResults.slice(offset, offset + limit);

        // Extract post IDs from search results
        const postIds = paginatedResults
            .map(result => result.id)
            .filter(id => id !== undefined && id !== null);

        // Fetch full post details from MongoDB
        const posts = await Post.find({ 
            qdrantId: { $in: postIds },
            isAvailable: { $ne: false }
        })
        .populate({ 
            path: 'author', 
            select: 'username email', 
            match: { isAvailable: { $ne: false } } 
        });

        // Filter out posts with unavailable authors
        const availablePosts = posts.filter(post => Boolean(post.author));

        // Sort posts to match the order from Qdrant search results
        const postMap = new Map(availablePosts.map(post => [post.qdrantId, post]));
        const sortedPosts = postIds
            .map(id => postMap.get(id))
            .filter(Boolean);

        return res.status(200).json({
            message: 'Similar posts retrieved successfully',
            posts: sortedPosts,
            pagination: {
                page,
                limit,
                totalResults: filteredResults.length,
                totalPages: Math.max(Math.ceil(filteredResults.length / limit), 1),
                hasPrevPage: page > 1,
                hasNextPage: page < Math.ceil(filteredResults.length / limit)
            }
        });

    } catch (error) {
        console.error('Error in get_posts_by_similarity:', error);
        return res.status(500).json({ 
            message: 'Error while searching similar posts' 
        });
    }
}