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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var CacheService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
let CacheService = CacheService_1 = class CacheService {
    constructor(cacheManager) {
        this.cacheManager = cacheManager;
        this.logger = new common_1.Logger(CacheService_1.name);
    }
    async get(key) {
        try {
            const value = await this.cacheManager.get(key);
            if (value !== undefined) {
                this.logger.debug(`Cache hit for key: ${key}`);
                return value;
            }
            this.logger.debug(`Cache miss for key: ${key}`);
            return null;
        }
        catch (error) {
            this.logger.error(`Cache get error for key ${key}:`, error);
            return null;
        }
    }
    async set(key, value, options = {}) {
        try {
            const ttl = options.ttl || 300;
            await this.cacheManager.set(key, value, ttl);
            this.logger.debug(`Cache set for key: ${key} with TTL: ${ttl}s`);
        }
        catch (error) {
            this.logger.error(`Cache set error for key ${key}:`, error);
        }
    }
    async delete(key) {
        try {
            await this.cacheManager.del(key);
            this.logger.debug(`Cache deleted for key: ${key}`);
        }
        catch (error) {
            this.logger.error(`Cache delete error for key ${key}:`, error);
        }
    }
    async deletePattern(pattern) {
        try {
            this.logger.debug(`Cache delete pattern: ${pattern}`);
        }
        catch (error) {
            this.logger.error(`Cache delete pattern error for ${pattern}:`, error);
        }
    }
    async clear() {
        try {
            await this.cacheManager.clear();
            this.logger.debug('Cache cleared');
        }
        catch (error) {
            this.logger.error('Cache clear error:', error);
        }
    }
    async getOrSet(key, factory, options = {}) {
        let value = await this.get(key);
        if (value === null) {
            value = await factory();
            await this.set(key, value, options);
        }
        return value;
    }
    generateIncidentKey(incidentId) {
        return `incident:${incidentId}`;
    }
    generateIncidentsListKey(filters) {
        const sortedFilters = Object.keys(filters)
            .sort()
            .map(key => `${key}:${filters[key]}`)
            .join('|');
        return `incidents:list:${sortedFilters}`;
    }
    generateUserKey(userId) {
        return `user:${userId}`;
    }
    generateOnCallKey(scheduleId) {
        return scheduleId ? `oncall:schedule:${scheduleId}` : 'oncall:current';
    }
    async invalidateIncidentCache(incidentId) {
        await Promise.all([
            this.delete(this.generateIncidentKey(incidentId)),
            this.deletePattern(`incidents:list:*`),
        ]);
    }
    async invalidateUserCache(userId) {
        await Promise.all([
            this.delete(this.generateUserKey(userId)),
            this.deletePattern(`incidents:*assignedTo:${userId}*`),
            this.deletePattern(`incidents:*createdBy:${userId}*`),
        ]);
    }
    async invalidateOnCallCache(scheduleId) {
        if (scheduleId) {
            await this.delete(this.generateOnCallKey(scheduleId));
        }
        else {
            await this.deletePattern('oncall:*');
        }
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object])
], CacheService);
//# sourceMappingURL=cache.service.js.map