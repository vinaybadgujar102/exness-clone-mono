import { createClient, type RedisClientType } from "redis";

const globalForRedis = globalThis as unknown as {
  redis?: RedisClientType;
};

export const redis = globalForRedis.redis ?? createClient();

if (!globalForRedis.redis) {
  try {
    await redis.connect();
    globalForRedis.redis = redis;
  } catch (error) {
    console.error(error);
  }
}
