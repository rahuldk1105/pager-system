import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DatabaseConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    const isProduction = this.configService.get('NODE_ENV') === 'production';
    const isTest = this.configService.get('NODE_ENV') === 'test';

    // SSL configuration
    let ssl: any = false;
    if (isProduction) {
      ssl = {
        rejectUnauthorized: this.configService.get('DB_SSL_REJECT_UNAUTHORIZED', true),
        ca: this.configService.get('DB_SSL_CA'),
        cert: this.configService.get('DB_SSL_CERT'),
        key: this.configService.get('DB_SSL_KEY'),
      };
    }

    return {
      type: 'postgres',
      host: this.configService.get('DB_HOST', 'localhost'),
      port: parseInt(this.configService.get('DB_PORT', '5432'), 10),
      username: this.configService.get('DB_USERNAME', 'postgres'),
      password: this.configService.get('DB_PASSWORD', 'password'),
      database: this.configService.get('DB_NAME', 'pager_dev'),
      ssl,
      synchronize: !isProduction && !isTest, // Never in production or tests
      dropSchema: false,
      logging: this.configService.get('DB_LOGGING', false),
      entities: [__dirname + '/../**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
      subscribers: [__dirname + '/../database/subscribers/*{.ts,.js}'],
      // Connection pool settings
      extra: {
        max: parseInt(this.configService.get('DB_MAX_CONNECTIONS', '20'), 10),
        min: parseInt(this.configService.get('DB_MIN_CONNECTIONS', '2'), 10),
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        acquireTimeoutMillis: 60000,
        statement_timeout: 60000,
        query_timeout: 60000,
      },
      // Retry configuration
      retryAttempts: isProduction ? 3 : 1,
      retryDelay: 1000,
    };
  }
}