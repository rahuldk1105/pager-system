import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  retryDelayOnFailover?: number;
  maxRetriesPerRequest?: number;
}

@Injectable()
export class RedisConfigService {
  constructor(private configService: ConfigService) {}

  getConfig(): RedisConfig {
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
}