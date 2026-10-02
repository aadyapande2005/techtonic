import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import embeddingService from "../recommendation_engine/embeddings/embedding.service.js";
import qdrantService from "../recommendation_engine/vectors/qdrant.service.js";
import connectdb from "../config/db.js";
import Post from "../models/posts.model.js";

await connectdb();

const worker = new Worker(
    "insert-post",

    async (job) => {

        const { post } = job.data;

        console.log(`Inserting post: ${post._id}`);

        const uuid = qdrantService.createId();

        const postVector = await embeddingService.generatePostEmbedding(post);

        await qdrantService.upsert("posts", uuid, postVector, { id: post._id, title: post.title, summary: post.summary, content: post.description, topics: post.topics });

        await Post.findByIdAndUpdate(post._id, { qdrantId: uuid });
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