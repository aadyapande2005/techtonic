import { Worker } from "bullmq";
import { redisConnection } from "./redis.js";
import { buildUserProfile } from "./profile.services.js";

const worker = new Worker(
    "profile-update",

    async (job) => {

        const { userId } = job.data;

        console.log(`Updating profile for ${userId}`);

        await buildUserProfile(userId);
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