import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import connectdb from "../config/db.js";
import { refreshRelatedPostsForPost } from "../services/relatedPosts.service.js";

await connectdb();

const worker = new Worker(
    "related-posts",

    async (job) => {
        const { postId } = job.data;

        console.log(`[RelatedPostsWorker] Processing related posts refresh for post: ${postId}`);

        await refreshRelatedPostsForPost(postId);
    },

    {
        connection: redisConnection,
        concurrency: 5,
    }
);

worker.on("completed", (job) => {
    console.log(`[RelatedPostsWorker] Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
    console.error(`[RelatedPostsWorker] Job ${job?.id} failed`);
    console.error(err);
});
