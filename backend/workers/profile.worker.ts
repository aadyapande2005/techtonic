import { Worker } from "bullmq";
import { redisConnection } from "../config/redis.js";
import profileBuilderService from "../recommendation_engine/profile_builder/profile_builder.service.js";
import {profileQueue} from "../queues/profile.queue.js";
import connectdb from "../config/db.js";

await connectdb();

// await profileQueue.obliterate({ force: true });

// const jobs = await profileQueue.getJobs([
//   'waiting',
//   'active',
//   'completed',
//   'failed',
//   'delayed',
//   'paused',
// ]);

// for (const job of jobs) {
//   console.log({ id: job.id, name: job.name, data: job.data, isCompleted: await job.isCompleted(), isFailed: await job.isFailed(), isWaiting: await job.isWaiting() });
//   console.log(job.toJSON())
  
// }

const worker = new Worker(
    "profile-update",

    async (job) => {

        const { userId } = job.data;

        console.log(`Processing profile update for user ${userId}`);

        await profileBuilderService.buildProfile(userId); 

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