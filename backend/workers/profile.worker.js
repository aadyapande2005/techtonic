import { Worker } from "bullmq";
import { redisConnection } from "../redis.js";
import embeddingService from "../recommendation_engine/embeddings/embedding.service.js";
import qdrantService from "../recommendation_engine/vectors/qdrant.service.js";

const worker = new Worker(
    "profile-update",

    async (job) => {

        const { user } = job.data;

        console.log(`Updating profile for ${user.id}`);

        const userVector = await embeddingService.generateUserEmbedding(user);

        await qdrantService.upsert("users", user.id, userVector, { name: user.name, bio: user.bio, interests: user.interests });

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