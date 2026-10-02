import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";


export const preferenceQueue = new Queue(
    "user-preference-initialize",
    {
        connection: redisConnection,
        defaultJobOptions: {
            removeOnComplete: 1000,
            removeOnFail: 5000,
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 5000,
            },
        },
    }
);

