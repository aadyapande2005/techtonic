import { Worker } from "bullmq";
import { redisConnection } from "../redis.js";
import embeddingService from "../recommendation_engine/embeddings/embedding.service.js";
import qdrantService from "../recommendation_engine/vectors/qdrant.service.js";

const post_worker = new Worker(
    "insert-post",

    async (job) => {

        const { post } = job.data;

        console.log(`Inserting post: ${post.id}`);

        const postVector = await embeddingService.generatePostEmbedding(post);

        await qdrantService.upsert("posts", post.id, postVector, { title: post.title, content: post.description, topics: post.topics });
    },

    {
        connection: redisConnection,
        concurrency: 5,
    }
);

post_worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed`);
});

post_worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed`);
    console.error(err);
});