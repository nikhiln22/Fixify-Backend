import Redis, { RedisOptions } from "ioredis";
import { IRedisService } from "../interfaces/Iredis/Iredis";
import config from "../config/env";

export class RedisService implements IRedisService {
  private client: Redis;

  constructor() {
    const needsTLS = config.REDIS_HOST.includes("redis-cloud.com");

    const redisConfig: RedisOptions = {
      host: config.REDIS_HOST,
      port: config.REDIS_PORT,
      password: config.REDIS_PASSWORD || undefined,
      username: config.REDIS_USERNAME || undefined,
    };

    if (needsTLS) {
      redisConfig.tls = {};
    }

    this.client = new Redis(redisConfig);

    this.client.on("error", (err) => {
      console.error("Redis connection error:", err);
    });

    this.client.on("connect", () => {
      const redisType = needsTLS ? "Redis Cloud" : "Local Redis";
      console.log(`Connecting to ${redisType}...`);
    });

    this.client.on("ready", () => {
      const redisType = needsTLS ? "Redis Cloud" : "Local Redis";
      console.log(`Connected to ${redisType} successfully`);
    });
  }

  async set(key: string, value: string, expireSeconds: number): Promise<void> {
    try {
      await this.client.set(key, value, "EX", expireSeconds);
    } catch (error) {
      console.error("Redis set error:", error);
      throw new Error("Failed to store data in Redis");
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error("Redis get error:", error);
      throw new Error("Failed to retrieve data from Redis");
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error("Redis delete error:", error);
      throw new Error("Failed to delete data from Redis");
    }
  }
}
