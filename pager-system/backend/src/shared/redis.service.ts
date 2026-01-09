import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisConfigService } from '../config/redis.config';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor(private configService: RedisConfigService) {
    const config = this.configService.getConfig();
    this.client = new Redis(config);

    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    this.client.on('ready', () => {
      this.logger.log('Redis client ready');
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }

  // Basic operations
  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      this.logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    try {
      if (ttlSeconds) {
        await this.client.setex(key, ttlSeconds, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      this.logger.error(`Redis SET error for key ${key}:`, error);
      throw error;
    }
  }

  async setex(key: string, ttlSeconds: number, value: string): Promise<void> {
    try {
      await this.client.setex(key, ttlSeconds, value);
    } catch (error) {
      this.logger.error(`Redis SETEX error for key ${key}:`, error);
      throw error;
    }
  }

  async del(key: string | string[]): Promise<number> {
    try {
      const keys = Array.isArray(key) ? key : [key];
      return await this.client.del(...keys);
    } catch (error) {
      this.logger.error(`Redis DEL error for key ${key}:`, error);
      return 0;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  async expire(key: string, ttlSeconds: number): Promise<boolean> {
    try {
      const result = await this.client.expire(key, ttlSeconds);
      return result === 1;
    } catch (error) {
      this.logger.error(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(`Redis TTL error for key ${key}:`, error);
      return -2; // Key doesn't exist
    }
  }

  // Hash operations
  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      this.logger.error(`Redis HGET error for key ${key}, field ${field}:`, error);
      return null;
    }
  }

  async hset(key: string, field: string, value: string): Promise<number> {
    try {
      return await this.client.hset(key, field, value);
    } catch (error) {
      this.logger.error(`Redis HSET error for key ${key}, field ${field}:`, error);
      throw error;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      this.logger.error(`Redis HGETALL error for key ${key}:`, error);
      return {};
    }
  }

  async hdel(key: string, fields: string | string[]): Promise<number> {
    try {
      const fieldArray = Array.isArray(fields) ? fields : [fields];
      return await this.client.hdel(key, ...fieldArray);
    } catch (error) {
      this.logger.error(`Redis HDEL error for key ${key}:`, error);
      return 0;
    }
  }

  // Set operations
  async sadd(key: string, members: string | string[]): Promise<number> {
    try {
      const memberArray = Array.isArray(members) ? members : [members];
      return await this.client.sadd(key, ...memberArray);
    } catch (error) {
      this.logger.error(`Redis SADD error for key ${key}:`, error);
      return 0;
    }
  }

  async srem(key: string, members: string | string[]): Promise<number> {
    try {
      const memberArray = Array.isArray(members) ? members : [members];
      return await this.client.srem(key, ...memberArray);
    } catch (error) {
      this.logger.error(`Redis SREM error for key ${key}:`, error);
      return 0;
    }
  }

  async sismember(key: string, member: string): Promise<boolean> {
    try {
      const result = await this.client.sismember(key, member);
      return result === 1;
    } catch (error) {
      this.logger.error(`Redis SISMEMBER error for key ${key}:`, error);
      return false;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key);
    } catch (error) {
      this.logger.error(`Redis SMEMBERS error for key ${key}:`, error);
      return [];
    }
  }

  // Sorted set operations
  async zadd(key: string, score: number, member: string): Promise<number> {
    try {
      return await this.client.zadd(key, score, member);
    } catch (error) {
      this.logger.error(`Redis ZADD error for key ${key}:`, error);
      return 0;
    }
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.zrange(key, start, stop);
    } catch (error) {
      this.logger.error(`Redis ZRANGE error for key ${key}:`, error);
      return [];
    }
  }

  async zrem(key: string, members: string | string[]): Promise<number> {
    try {
      const memberArray = Array.isArray(members) ? members : [members];
      return await this.client.zrem(key, ...memberArray);
    } catch (error) {
      this.logger.error(`Redis ZREM error for key ${key}:`, error);
      return 0;
    }
  }

  // List operations
  async lpush(key: string, values: string | string[]): Promise<number> {
    try {
      const valueArray = Array.isArray(values) ? values : [values];
      return await this.client.lpush(key, ...valueArray);
    } catch (error) {
      this.logger.error(`Redis LPUSH error for key ${key}:`, error);
      return 0;
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      return await this.client.rpop(key);
    } catch (error) {
      this.logger.error(`Redis RPOP error for key ${key}:`, error);
      return null;
    }
  }

  async llen(key: string): Promise<number> {
    try {
      return await this.client.llen(key);
    } catch (error) {
      this.logger.error(`Redis LLEN error for key ${key}:`, error);
      return 0;
    }
  }

  // Utility methods
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      this.logger.error(`Redis KEYS error for pattern ${pattern}:`, error);
      return [];
    }
  }

  async flushall(): Promise<void> {
    try {
      await this.client.flushall();
    } catch (error) {
      this.logger.error('Redis FLUSHALL error:', error);
      throw error;
    }
  }

  getClient(): Redis {
    return this.client;
  }
}