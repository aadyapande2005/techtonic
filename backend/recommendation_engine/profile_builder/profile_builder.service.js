import User from '../../models/user.model.js';
import UserInteraction from '../../models/user_interaction.model.js';
import QdrantService from '../vectors/qdrant.service.js';
import EmbeddingService from '../embeddings/embedding.service.js';

class profileBuilderService {

    LIKE_INTERACTION_WEIGHT = 1.0; // Weight for LIKE interactions
    SAVE_INTERACTION_WEIGHT = 0.8; // Weight for SAVE interactions
    COMMENT_INTERACTION_WEIGHT = 0.6; // Weight for COMMENT interactions
    SEARCH_INTERACTION_WEIGHT = 0.4; // Weight for SEARCH interactions
    VIEW_INTERACTION_WEIGHT = 0.2; // Weight for VIEW interactions
    UNLIKE_INTERACTION_WEIGHT = -1.0; // Weight for UNLIKE interactions
    UNSAVE_INTERACTION_WEIGHT = -0.8; // Weight for UNSAVE interactions
    NEW_USER_INTERACTION_WEIGHT = 0.2; // Weight for user's new interactions

    normalizeVector(vector) {

        const magnitude = Math.sqrt(
            vector.reduce((sum, value) => sum + value * value, 0)
        );

        if (magnitude === 0) {
            return vector;
        }

        return vector.map(value => value / magnitude);        
    }

    async buildProfile(userId) {

        try {

            const userLastUpdate = await User.findById(userId, 'username email lastInteractionUpdate qdrantId');

            console.log("userLastUpdate", userLastUpdate);

            if(!userLastUpdate) {
                throw new Error(`User ${userId} not found`);
            }
            
            let lastUpdated = userLastUpdate.lastInteractionUpdate;

            if(!lastUpdated) {
                console.log(`User ${userId} is a new user`);
                lastUpdated = new Date(0);
            }

            console.log("lastUpdated", lastUpdated.toISOString());

            const qdrantId = userLastUpdate.qdrantId;

            if(!qdrantId) {
                throw new Error(`User ${userId} does not have a qdrant id`);
            }
    
            const currentTime = new Date();
            const userInteractions = await UserInteraction.find({ 
                userId, 
                timestamp: { $gt: lastUpdated, $lte: currentTime } 
            });

            console.log(userInteractions);
    
            if (!userInteractions || userInteractions.length === 0) {
                console.log(`No interactions found for user ${userId}`);
                return;
            }

            const qdrantUser = await QdrantService.retrieve("users", qdrantId);

            if(!qdrantUser){
                throw new Error(`User ${userId} not present in qdrant`);                
            }

            let userVector = qdrantUser.vector;
            
            let updatedUserVector = new Array(userVector.length).fill(0);

            console.log("userVector", userVector.slice(0, 10));
    
            for (const interaction of userInteractions) {
    
                const { interactionType, qdrantId, metadata, timestamp } = interaction;

                if(!interactionType || (!qdrantId && interactionType !== "SEARCH")) {
                    console.log(`Skipping interaction ${interaction._id} due to invalid interaction type or missing qdrantId`);
                    continue;
                }
    
                let interactionVector = null;
                let weight = 0;

                switch (interactionType) {
                    case 'LIKE':
                        interactionVector = await QdrantService.retrieve("posts", qdrantId);
                        weight = this.LIKE_INTERACTION_WEIGHT;
                        break;
                    case 'SAVE':
                        interactionVector = await QdrantService.retrieve("posts", qdrantId);
                        weight = this.SAVE_INTERACTION_WEIGHT;
                        break;
                    case 'COMMENT':
                        interactionVector = await QdrantService.retrieve("posts", qdrantId);
                        weight = this.COMMENT_INTERACTION_WEIGHT;
                        break;
                    case 'SEARCH':
                        if (metadata && metadata.searchQuery) {
                            const searchVector = await EmbeddingService.generateEmbedding(metadata.searchQuery);
                            interactionVector = { vector: searchVector };
                        }
                        weight = this.SEARCH_INTERACTION_WEIGHT;
                        break;
                    case 'VIEW':
                        interactionVector = await QdrantService.retrieve("posts", qdrantId);
                        weight = this.VIEW_INTERACTION_WEIGHT;
                        break;
                    case 'UNLIKE':
                        interactionVector = await QdrantService.retrieve("posts", qdrantId);
                        weight = this.UNLIKE_INTERACTION_WEIGHT;
                        break;
                    case 'UNSAVE':
                        interactionVector = await QdrantService.retrieve("posts", qdrantId);
                        weight = this.UNSAVE_INTERACTION_WEIGHT;
                        break;
                }

                if (interactionVector && interactionVector.vector) {
                    updatedUserVector = updatedUserVector.map((value, index) => value + weight * interactionVector.vector[index]);
                } else {
                    console.log(`Vector not found or invalid for interaction ${interaction._id}`);
                }
                
                console.log("updatedUserVector", updatedUserVector.slice(0, 10));
            }
            
            updatedUserVector = this.normalizeVector(updatedUserVector);

            userVector = userVector.map((value, index) => (1 - this.NEW_USER_INTERACTION_WEIGHT) * value + this.NEW_USER_INTERACTION_WEIGHT * updatedUserVector[index]);

            let normalizedUserVector = this.normalizeVector(userVector);

            console.log("normalizedUserVector", normalizedUserVector.slice(0, 10));

            await QdrantService.upsert(
                "users", 
                qdrantId, 
                normalizedUserVector, 
                { 
                    id: userId,
                    username: userLastUpdate.username, 
                    email: userLastUpdate.email 
                }
            );

            await User.findByIdAndUpdate(userId, { lastInteractionUpdate: currentTime });

        } catch (error) {
            console.error(`Error building profile for user ${userId}:`, error);
            error.message = `Error building profile for user ${userId}: ${error.message}`;
            throw error; 
        }

    }
}

export default new profileBuilderService();