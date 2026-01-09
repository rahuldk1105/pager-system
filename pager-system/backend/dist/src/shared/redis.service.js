"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var RedisService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisService = void 0;
const common_1 = require("@nestjs/common");
const ioredis_1 = require("ioredis");
const redis_config_1 = require("../config/redis.config");
let RedisService = RedisService_1 = class RedisService {
    constructor(configService) {
        this.configService = configService;
        this.logger = new common_1.Logger(RedisService_1.name);
        const config = this.configService.getConfig();
        this.client = new ioredis_1.default(config);
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
    async get(key) {
        try {
            return await this.client.get(key);
        }
        catch (error) {
            this.logger.error(`Redis GET error for key ${key}:`, error);
            return null;
        }
    }
    async set(key, value, ttlSeconds) {
        try {
            if (ttlSeconds) {
                await this.client.setex(key, ttlSeconds, value);
            }
            else {
                await this.client.set(key, value);
            }
        }
        catch (error) {
            this.logger.error(`Redis SET error for key ${key}:`, error);
            throw error;
        }
    }
    async setex(key, ttlSeconds, value) {
        try {
            await this.client.setex(key, ttlSeconds, value);
        }
        catch (error) {
            this.logger.error(`Redis SETEX error for key ${key}:`, error);
            throw error;
        }
    }
    async del(key) {
        try {
            const keys = Array.isArray(key) ? key : [key];
            return await this.client.del(...keys);
        }
        catch (error) {
            this.logger.error(`Redis DEL error for key ${key}:`, error);
            return 0;
        }
    }
    async exists(key) {
        try {
            const result = await this.client.exists(key);
            return result === 1;
        }
        catch (error) {
            this.logger.error(`Redis EXISTS error for key ${key}:`, error);
            return false;
        }
    }
    async expire(key, ttlSeconds) {
        try {
            const result = await this.client.expire(key, ttlSeconds);
            return result === 1;
        }
        catch (error) {
            this.logger.error(`Redis EXPIRE error for key ${key}:`, error);
            return false;
        }
    }
    async ttl(key) {
        try {
            return await this.client.ttl(key);
        }
        catch (error) {
            this.logger.error(`Redis TTL error for key ${key}:`, error);
            return -2;
        }
    }
    async hget(key, field) {
        try {
            return await this.client.hget(key, field);
        }
        catch (error) {
            this.logger.error(`Redis HGET error for key ${key}, field ${field}:`, error);
            return null;
        }
    }
    async hset(key, field, value) {
        try {
            return await this.client.hset(key, field, value);
        }
        catch (error) {
            this.logger.error(`Redis HSET error for key ${key}, field ${field}:`, error);
            throw error;
        }
    }
    async hgetall(key) {
        try {
            return await this.client.hgetall(key);
        }
        catch (error) {
            this.logger.error(`Redis HGETALL error for key ${key}:`, error);
            return {};
        }
    }
    async hdel(key, fields) {
        try {
            const fieldArray = Array.isArray(fields) ? fields : [fields];
            return await this.client.hdel(key, ...fieldArray);
        }
        catch (error) {
            this.logger.error(`Redis HDEL error for key ${key}:`, error);
            return 0;
        }
    }
    async sadd(key, members) {
        try {
            const memberArray = Array.isArray(members) ? members : [members];
            return await this.client.sadd(key, ...memberArray);
        }
        catch (error) {
            this.logger.error(`Redis SADD error for key ${key}:`, error);
            return 0;
        }
    }
    async srem(key, members) {
        try {
            const memberArray = Array.isArray(members) ? members : [members];
            return await this.client.srem(key, ...memberArray);
        }
        catch (error) {
            this.logger.error(`Redis SREM error for key ${key}:`, error);
            return 0;
        }
    }
    async sismember(key, member) {
        try {
            const result = await this.client.sismember(key, member);
            return result === 1;
        }
        catch (error) {
            this.logger.error(`Redis SISMEMBER error for key ${key}:`, error);
            return false;
        }
    }
    async smembers(key) {
        try {
            return await this.client.smembers(key);
        }
        catch (error) {
            this.logger.error(`Redis SMEMBERS error for key ${key}:`, error);
            return [];
        }
    }
    async zadd(key, score, member) {
        try {
            return await this.client.zadd(key, score, member);
        }
        catch (error) {
            this.logger.error(`Redis ZADD error for key ${key}:`, error);
            return 0;
        }
    }
    async zrange(key, start, stop) {
        try {
            return await this.client.zrange(key, start, stop);
        }
        catch (error) {
            this.logger.error(`Redis ZRANGE error for key ${key}:`, error);
            return [];
        }
    }
    async zrem(key, members) {
        try {
            const memberArray = Array.isArray(members) ? members : [members];
            return await this.client.zrem(key, ...memberArray);
        }
        catch (error) {
            this.logger.error(`Redis ZREM error for key ${key}:`, error);
            return 0;
        }
    }
    async lpush(key, values) {
        try {
            const valueArray = Array.isArray(values) ? values : [values];
            return await this.client.lpush(key, ...valueArray);
        }
        catch (error) {
            this.logger.error(`Redis LPUSH error for key ${key}:`, error);
            return 0;
        }
    }
    async rpop(key) {
        try {
            return await this.client.rpop(key);
        }
        catch (error) {
            this.logger.error(`Redis RPOP error for key ${key}:`, error);
            return null;
        }
    }
    async llen(key) {
        try {
            return await this.client.llen(key);
        }
        catch (error) {
            this.logger.error(`Redis LLEN error for key ${key}:`, error);
            return 0;
        }
    }
    async keys(pattern) {
        try {
            return await this.client.keys(pattern);
        }
        catch (error) {
            this.logger.error(`Redis KEYS error for pattern ${pattern}:`, error);
            return [];
        }
    }
    async flushall() {
        try {
            await this.client.flushall();
        }
        catch (error) {
            this.logger.error('Redis FLUSHALL error:', error);
            throw error;
        }
    }
    getClient() {
        return this.client;
    }
};
exports.RedisService = RedisService;
exports.RedisService = RedisService = RedisService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_config_1.RedisConfigService])
], RedisService);
//# sourceMappingURL=redis.service.js.map