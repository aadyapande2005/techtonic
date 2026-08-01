import connectdb from "../config/db.js";
import Post from "../models/posts.model.js";
import embeddingService from "../recommendation_engine/embeddings/embedding.service.js";
import qdrantService from "../recommendation_engine/vectors/qdrant.service.js";
import { initializeCollections } from "../recommendation_engine/vectors/qdrant.collections.js";

async function backfillPosts() {
    try {
        console.log("Connecting to database...");
        await connectdb();
        
        console.log("Initializing Qdrant collections...");
        await initializeCollections();
        
        console.log("Fetching all posts from database...");
        const posts = await Post.find({}).lean();
        
        console.log(`Found ${posts.length} posts to process`);
        
        if (posts.length === 0) {
            console.log("No posts found. Exiting.");
            return;
        }
        
        let processed = 0;
        let skipped = 0;
        let errors = 0;
        
        for (const post of posts) {
            try {
                // Skip if already has qdrantId
                if (post.qdrantId) {
                    console.log(`Skipping post ${post._id} - already has qdrantId: ${post.qdrantId}`);
                    skipped++;
                    continue;
                }
                
                console.log(`Processing post ${post._id}: ${post.title}`);
                
                // Generate embedding
                const postVector = await embeddingService.generatePostEmbedding(post);
                
                // Create UUID for Qdrant
                const uuid = qdrantService.createId();
                
                // Upsert to Qdrant
                await qdrantService.upsert("posts", uuid, postVector, {
                    id: post._id.toString(),
                    title: post.title,
                    content: post.description,
                    topics: post.topics
                });
                
                // Update post with qdrantId
                await Post.findByIdAndUpdate(post._id, { qdrantId: uuid });
                
                console.log(`✓ Successfully processed post ${post._id} with qdrantId: ${uuid}`);
                processed++;
                
            } catch (error) {
                console.error(`✗ Error processing post ${post._id}:`, error.message);
                errors++;
            }
        }
        
        console.log("\n=== Backfill Summary ===");
        console.log(`Total posts: ${posts.length}`);
        console.log(`Processed: ${processed}`);
        console.log(`Skipped (already had qdrantId): ${skipped}`);
        console.log(`Errors: ${errors}`);
        
    } catch (error) {
        console.error("Fatal error:", error);
    } finally {
        process.exit(0);
    }
}

backfillPosts();