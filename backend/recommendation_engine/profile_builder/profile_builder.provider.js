import User from '../../models/user.model.js';
import Post from '../../models/post.model.js';
import qdrantService from '../vectors/qdrant.service.js';

class ProfileBuilderProvider {
    
    async handleLikeInteraction(userId, postId, metadata) {

        try {
            
            console.log(`Updating profile for ${userId}`);
            
            const user = await User.findById(userId);
            const post = await Post.findById(postId);
            
            if(!user.qdrantId) {
                console.log(`User does not have a qdrant id`)
                return
            }
            
            const qdrant_user = await qdrantService.retrieve("users", user.qdrantId);
            
            if (!qdrant_user) {
                console.error(`User with qdrantId ${user.qdrantId} not found`);
            }
            
            console.log(qdrant_user);     
            
            if(!post.qdrantId) {
                console.log(`Post does not have a qdrant id`)
                return
            }
            
            const qdrant_post = await qdrantService.retrieve("posts", post.qdrantId);
            
            if (!qdrant_post) {
                console.error(`Post with qdrantId ${post.qdrantId} not found`);
            }
            
            console.log(qdrant_post)
            
            const userVector = qdrant_user.vector;
            const postVector = qdrant_post.vector;
            
            const updatedUserVector = userVector.map((value, index) => 0.8*value + 0.2*postVector[index]);
            
            console.log(updatedUserVector)
            
            await qdrantService.upsert(
                "users", 
                user.qdrantId, 
                updatedUserVector, 
                { 
                    id: user.id,
                    username: user.username, 
                    email: user.email 
                }
            );

        } catch (error) {
            console.error(`Error handling LIKE interaction for user ${userId} and post ${postId}:`, error);
            error.message = `Error handling LIKE interaction for user ${userId} and post ${postId}: ${error.message}`;
            throw error; 
        }

    }

    async handleSaveInteraction(userId, postId, metadata) {}

    async handleCommentInteraction(userId, postId, metadata) {}

    async handleSearchInteraction(userId, metadata) {}

    async handleViewInteraction(userId, postId, metadata) {}

    async handleUnlikeInteraction(userId, postId, metadata) {}

    async handleUnsaveInteraction(userId, postId, metadata) {}



}

export default new ProfileBuilderProvider();