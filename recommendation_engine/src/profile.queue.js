import { Queue } from "bullmq";
import { redisConnection } from "./redis.js";


export const profileQueue = new Queue(
    "profile-update",
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

