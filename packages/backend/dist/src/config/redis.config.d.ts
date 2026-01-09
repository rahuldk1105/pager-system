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
export declare class RedisConfigService {
    private configService;
    constructor(configService: ConfigService);
    getConfig(): RedisConfig;
    getBullConfig(): {
        redis: {
            host: string;
            port: number;
            password: string;
            db: number;
        };
        defaultJobOptions: {
            removeOnComplete: number;
            removeOnFail: number;
            attempts: number;
            backoff: {
                type: string;
                delay: number;
            };
        };
    };
}
