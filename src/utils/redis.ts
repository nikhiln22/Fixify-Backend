import Redis from "ioredis";
import { IRedisService } from "../interfaces/Iredis/Iredis";
import config from "../config/env";

export class RedisService implements IRedisService {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: config.REDIS_HOST,
      port: Number(config.REDIS_PORT),
      password: config.REDIS_PASSWORD || undefined,
      connectTimeout: 10000,
    });

    this.client.on("error", (err) => {
      console.error("Redis connection error:", err);
    });

    this.client.on("connect", () => {
      console.log(
        `Connecting to Redis at ${config.REDIS_HOST}:${config.REDIS_PORT}`
      );
    });

    this.client.on("ready", () => {
      console.log(`Redis connected successfully.`);
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

  async setObject(
    key: string,
    value: object,
    expireSeconds: number
  ): Promise<void> {
    try {
      const jsonString = JSON.stringify(value);
      await this.client.set(key, jsonString, "EX", expireSeconds);
    } catch (error) {
      console.error("Redis setObject error:", error);
      throw new Error("Failed to store the object in Redis");
    }
  }

  async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonString = await this.client.get(key);
      return jsonString ? JSON.parse(jsonString) : null;
    } catch (error) {
      console.error("Redis getObject error:", error);
      throw new Error("Failed to retrieve object from Redis");
    }
  }
}
