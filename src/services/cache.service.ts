import { createClient, RedisClientType } from "redis";
import { envConfig } from "src/configs/env.config";

class CacheService {
  private client: RedisClientType<any>;
  private isConnected: boolean = false;

  constructor() {
    this.client = createClient({
      socket: {
        host: envConfig.redis.host,
        port: envConfig.redis.port,
      },
      password: envConfig.redis.password || undefined,
    });

    // Attach event listeners
    this.client.on("error", (err) => {
      console.error("Redis Client Error:", err);
      this.isConnected = false;
    });

    this.client.on("connect", () => {
      console.log("Redis client connected");
      this.isConnected = true;
    });

    this.client.on("end", () => {
      console.log("Redis client disconnected");
      this.isConnected = false;
    });

    // Connect to Redis
    this.connect();
  }

  /**
   * Connect to the Redis server.
   */
  private async connect(): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.client.connect();
        console.log("Connected to Redis");
      }
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
    }
  }

  /**
   * Set a value in the cache with an optional expiration time.
   * @param key - The cache key.
   * @param value - The value to cache.
   * @param ttl - Time-to-live in seconds (optional).
   */
  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.connect(); 
      }

      const stringValue = JSON.stringify(value);
      if (ttl) {
        await this.client.set(key, stringValue, { EX: ttl });
      } else {
        await this.client.set(key, stringValue);
      }
    } catch (error) {
      console.error(`Error setting cache for key "${key}":`, error);
      throw new Error("Failed to set cache");
    }
  }

  /**
   * Get a value from the cache.
   * @param key - The cache key.
   * @returns The cached value or null if not found.
   */
  public async get<T>(key: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        await this.connect(); // Ensure connection is available
      }

      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error retrieving cache for key "${key}":`, error);
      throw new Error("Failed to get cache");
    }
  }

  /**
   * Delete a value from the cache.
   * @param key - The cache key.
   */
  public async delete(key: string): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.connect(); // Ensure connection is available
      }

      await this.client.del(key);
    } catch (error) {
      console.error(`Error deleting cache for key "${key}":`, error);
      throw new Error("Failed to delete cache");
    }
  }

  /**
   * Clear all cache entries.
   */
  public async clearAll(): Promise<void> {
    try {
      if (!this.isConnected) {
        await this.connect(); // Ensure connection is available
      }

      await this.client.flushAll();
    } catch (error) {
      console.error("Error clearing all cache:", error);
      throw new Error("Failed to clear cache");
    }
  }

  /**
   * Gracefully disconnect from Redis.
   */
  public async disconnect(): Promise<void> {
    try {
      if (this.isConnected) {
        await this.client.disconnect();
        console.log("Disconnected from Redis");
      }
    } catch (error) {
      console.error("Failed to disconnect from Redis:", error);
    }
  }
}

export default new CacheService();