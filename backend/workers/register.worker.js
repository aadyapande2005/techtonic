import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import embeddingService from "../recommendation_engine/embeddings/embedding.service.js";
import qdrantService from "../recommendation_engine/vectors/qdrant.service.js";
import User from "../models/user.model.js";
import connectdb from "../config/db.js";

await connectdb();

const worker = new Worker(
    "user-preference-initialize",

    async (job) => {
        
        const { user } = job.data;

        console.log(`Initializing user preference for user: ${user.username}`);

        const interestsVector = await embeddingService.generateEmbedding(user.interests);

        const uuid = qdrantService.createId();

        console.log(`Generated interests vector for user: ${user.username}`);

        await qdrantService.upsert(
                "users", 
                uuid, 
                interestsVector, 
                { 
                    id: user.id,
                    username: user.username, 
                    email: user.email 
                }
            );

        await User.findByIdAndUpdate(user.id, { qdrantId: uuid });
        

        console.log(`Upserted user preference for user: ${user.username}`);

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
    // TODO: revert the changes made to the database if the job fails
    
    console.error(`Job ${job?.id} failed`);
    console.error(err);
});
