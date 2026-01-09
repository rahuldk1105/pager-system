"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const bull_1 = require("@nestjs/bull");
const cache_manager_1 = require("@nestjs/cache-manager");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const health_module_1 = require("./health/health.module");
const incidents_module_1 = require("./incidents/incidents.module");
const escalation_module_1 = require("./escalation/escalation.module");
const on_call_module_1 = require("./on-call/on-call.module");
const notifications_module_1 = require("./notifications/notifications.module");
const database_config_1 = require("./config/database.config");
const redis_config_1 = require("./config/redis.config");
const redis_service_1 = require("./shared/redis.service");
const cache_service_1 = require("./shared/cache.service");
const circuit_breaker_service_1 = require("./shared/circuit-breaker.service");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['.env.local', '.env'],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                useClass: database_config_1.DatabaseConfigService,
            }),
            bull_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (redisConfig) => redisConfig.getBullConfig(),
                inject: [redis_config_1.RedisConfigService],
            }),
            cache_manager_1.CacheModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (redisConfig) => ({
                    store: 'redis',
                    host: redisConfig.getConfig().host,
                    port: redisConfig.getConfig().port,
                    password: redisConfig.getConfig().password,
                    ttl: 300,
                }),
                inject: [redis_config_1.RedisConfigService],
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            health_module_1.HealthModule,
            incidents_module_1.IncidentsModule,
            escalation_module_1.EscalationModule,
            on_call_module_1.OnCallModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [],
        providers: [
            redis_service_1.RedisService,
            cache_service_1.CacheService,
            circuit_breaker_service_1.CircuitBreakerService,
        ],
        exports: [
            redis_service_1.RedisService,
            cache_service_1.CacheService,
            circuit_breaker_service_1.CircuitBreakerService,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map