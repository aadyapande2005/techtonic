import { Redis } from "ioredis";

export const redisConnection = new Redis({
    host: process.env.REDIS_HOST || "redis",  // Use the service name from compose.yaml
    port: Number(process.env.REDIS_PORT) || 6379,
    maxRetriesPerRequest: null,
});