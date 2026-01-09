import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthModule } from './health/health.module';
import { IncidentsModule } from './incidents/incidents.module';
import { EscalationModule } from './escalation/escalation.module';
import { OnCallModule } from './on-call/on-call.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DatabaseConfigService } from './config/database.config';
import { RedisConfigService } from './config/redis.config';
import { RedisService } from './shared/redis.service';
import { CacheService } from './shared/cache.service';
import { CircuitBreakerService } from './shared/circuit-breaker.service';

@Module({
  imports: [
    // Global configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Database configuration
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfigService,
    }),

    // Redis configuration
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (redisConfig: RedisConfigService) => redisConfig.getBullConfig(),
      inject: [RedisConfigService],
    }),

    // Cache configuration
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (redisConfig: RedisConfigService) => ({
        store: 'redis',
        host: redisConfig.getConfig().host,
        port: redisConfig.getConfig().port,
        password: redisConfig.getConfig().password,
        ttl: 300, // 5 minutes default
      }),
      inject: [RedisConfigService],
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    HealthModule,
    IncidentsModule,
    EscalationModule,
    OnCallModule,
    NotificationsModule,
  ],
  controllers: [],
  providers: [
    RedisService,
    CacheService,
    CircuitBreakerService,
  ],
  exports: [
    RedisService,
    CacheService,
    CircuitBreakerService,
  ],
})
export class AppModule {}