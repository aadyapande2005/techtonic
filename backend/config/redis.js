import IORedis from "ioredis";

export const redisConnection = new IORedis({
    host: process.env.REDIS_HOST || "redis",  // Use the service name from compose.yaml
    port: process.env.REDIS_PORT,     // Default Redis port
    maxRetriesPerRequest: null,
});