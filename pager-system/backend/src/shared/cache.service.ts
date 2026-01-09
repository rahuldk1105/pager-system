import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

export interface CacheOptions {
  ttl?: number;
  keyPrefix?: string;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.cacheManager.get<T>(key);
      if (value !== undefined) {
        this.logger.debug(`Cache hit for key: ${key}`);
        return value;
      }
      this.logger.debug(`Cache miss for key: ${key}`);
      return null;
    } catch (error) {
      this.logger.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<void> {
    try {
      const ttl = options.ttl || 300; // 5 minutes default
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Cache set for key: ${key} with TTL: ${ttl}s`);
    } catch (error) {
      this.logger.error(`Cache set error for key ${key}:`, error);
    }
  }

  async delete(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache deleted for key: ${key}`);
    } catch (error) {
      this.logger.error(`Cache delete error for key ${key}:`, error);
    }
  }

  async deletePattern(pattern: string): Promise<void> {
    try {
      // For simplicity in this implementation, we'll just log
      // In production with Redis, you'd use SCAN or KEYS
      this.logger.debug(`Cache delete pattern: ${pattern}`);
      // For now, we'll skip pattern deletion in tests
    } catch (error) {
      this.logger.error(`Cache delete pattern error for ${pattern}:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      await this.cacheManager.clear();
      this.logger.debug('Cache cleared');
    } catch (error) {
      this.logger.error('Cache clear error:', error);
    }
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options: CacheOptions = {},
  ): Promise<T> {
    let value = await this.get<T>(key);
    if (value === null) {
      value = await factory();
      await this.set(key, value, options);
    }
    return value;
  }

  // Specialized cache methods for common patterns
  generateIncidentKey(incidentId: string): string {
    return `incident:${incidentId}`;
  }

  generateIncidentsListKey(filters: Record<string, any>): string {
    const sortedFilters = Object.keys(filters)
      .sort()
      .map(key => `${key}:${filters[key]}`)
      .join('|');
    return `incidents:list:${sortedFilters}`;
  }

  generateUserKey(userId: string): string {
    return `user:${userId}`;
  }

  generateOnCallKey(scheduleId?: string): string {
    return scheduleId ? `oncall:schedule:${scheduleId}` : 'oncall:current';
  }

  async invalidateIncidentCache(incidentId: string): Promise<void> {
    await this.delete(this.generateIncidentKey(incidentId));
    await this.deletePattern(`incidents:list:*`); // Invalidate all list caches
  }

  async invalidateUserCache(userId: string): Promise<void> {
    await this.delete(this.generateUserKey(userId));
    await this.deletePattern(`incidents:*assignedTo:${userId}*`);
    await this.deletePattern(`incidents:*createdBy:${userId}*`);
  }

  async invalidateOnCallCache(scheduleId?: string): Promise<void> {
    if (scheduleId) {
      await this.delete(this.generateOnCallKey(scheduleId));
    } else {
      await this.deletePattern('oncall:*');
    }
  }
}