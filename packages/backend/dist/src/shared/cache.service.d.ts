import { Cache } from 'cache-manager';
export interface CacheOptions {
    ttl?: number;
    keyPrefix?: string;
}
export declare class CacheService {
    private cacheManager;
    private readonly logger;
    constructor(cacheManager: Cache);
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, options?: CacheOptions): Promise<void>;
    delete(key: string): Promise<void>;
    deletePattern(pattern: string): Promise<void>;
    clear(): Promise<void>;
    getOrSet<T>(key: string, factory: () => Promise<T>, options?: CacheOptions): Promise<T>;
    generateIncidentKey(incidentId: string): string;
    generateIncidentsListKey(filters: Record<string, any>): string;
    generateUserKey(userId: string): string;
    generateOnCallKey(scheduleId?: string): string;
    invalidateIncidentCache(incidentId: string): Promise<void>;
    invalidateUserCache(userId: string): Promise<void>;
    invalidateOnCallCache(scheduleId?: string): Promise<void>;
}
