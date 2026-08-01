import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import embeddingService from "../recommendation_engine/embeddings/embedding.service.js";
import qdrantService from "../recommendation_engine/vectors/qdrant.service.js";
import {profileQueue} from "../queues/profile.queue.js";


const worker = new Worker(
    "profile-update",

    async (job) => {

        const { user, post } = job.data;

        console.log(`Updating profile for ${user.id}`);

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

    },

    {
        connection: redisConnection,
        concurrency: 5,
    }
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed`);
    console.error(err);
});