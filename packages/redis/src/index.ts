import { createClient, type RedisClientType } from "redis";

const globalForRedis = globalThis as unknown as {
  publisher?: RedisClientType;
  subscriber?: RedisClientType;
};

export const publisher = globalForRedis.publisher ?? createClient();

export const subscriber = globalForRedis.subscriber ?? createClient();

if (!globalForRedis.publisher) {
  await publisher.connect();
  globalForRedis.publisher = publisher;
}

if (!globalForRedis.subscriber) {
  await subscriber.connect();
  globalForRedis.subscriber = subscriber;
}
