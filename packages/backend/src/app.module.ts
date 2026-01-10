import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
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
import { SupabaseConfigService } from './config/supabase.config';
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
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST', 'localhost'),
          port: parseInt(configService.get('REDIS_PORT', '6379'), 10),
          password: configService.get('REDIS_PASSWORD'),
          db: parseInt(configService.get('REDIS_DB', '0'), 10),
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
      }),
      inject: [ConfigService],
    }),

    // Cache configuration
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        store: 'redis',
        host: configService.get('REDIS_HOST', 'localhost'),
        port: parseInt(configService.get('REDIS_PORT', '6379'), 10),
        password: configService.get('REDIS_PASSWORD'),
        ttl: 300, // 5 minutes default
      }),
      inject: [ConfigService],
    }),

    // Feature modules
    AuthModule,
    UsersModule,
    HealthModule,
    // IncidentsModule, // Temporarily disabled
    // EscalationModule, // Temporarily disabled
    // OnCallModule, // Temporarily disabled
    // NotificationsModule, // Temporarily disabled
  ],
  controllers: [],
  providers: [
    DatabaseConfigService,
    RedisConfigService,
    SupabaseConfigService,
    RedisService,
    CacheService,
    CircuitBreakerService,
  ],
  exports: [
    DatabaseConfigService,
    RedisConfigService,
    SupabaseConfigService,
    RedisService,
    CacheService,
    CircuitBreakerService,
  ],
})
export class AppModule {}