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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let RedisConfigService = class RedisConfigService {
    constructor(configService) {
        this.configService = configService;
    }
    getConfig() {
        const isProduction = this.configService.get('NODE_ENV') === 'production';
        return {
            host: this.configService.get('REDIS_HOST', 'localhost'),
            port: parseInt(this.configService.get('REDIS_PORT', '6379'), 10),
            password: this.configService.get('REDIS_PASSWORD'),
            db: parseInt(this.configService.get('REDIS_DB', '0'), 10),
            keyPrefix: this.configService.get('REDIS_KEY_PREFIX', 'pager:'),
            retryDelayOnFailover: isProduction ? 100 : 10,
            maxRetriesPerRequest: isProduction ? 3 : 1,
        };
    }
    getBullConfig() {
        const config = this.getConfig();
        return {
            redis: {
                host: config.host,
                port: config.port,
                password: config.password,
                db: config.db,
            },
            defaultJobOptions: {
                removeOnComplete: 50,
                removeOnFail: 20,
                attempts: 3,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
            },
        };
    }
};
exports.RedisConfigService = RedisConfigService;
exports.RedisConfigService = RedisConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], RedisConfigService);
//# sourceMappingURL=redis.config.js.map