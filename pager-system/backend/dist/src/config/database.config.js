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
exports.DatabaseConfigService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
let DatabaseConfigService = class DatabaseConfigService {
    constructor(configService) {
        this.configService = configService;
    }
    createTypeOrmOptions() {
        const isProduction = this.configService.get('NODE_ENV') === 'production';
        const isTest = this.configService.get('NODE_ENV') === 'test';
        let ssl = false;
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
            synchronize: !isProduction && !isTest,
            dropSchema: false,
            logging: this.configService.get('DB_LOGGING', false),
            entities: [__dirname + '/../**/*.entity{.ts,.js}'],
            migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
            subscribers: [__dirname + '/../database/subscribers/*{.ts,.js}'],
            extra: {
                max: parseInt(this.configService.get('DB_MAX_CONNECTIONS', '20'), 10),
                min: parseInt(this.configService.get('DB_MIN_CONNECTIONS', '2'), 10),
                idleTimeoutMillis: 30000,
                connectionTimeoutMillis: 2000,
                acquireTimeoutMillis: 60000,
                statement_timeout: 60000,
                query_timeout: 60000,
            },
            retryAttempts: isProduction ? 3 : 1,
            retryDelay: 1000,
        };
    }
};
exports.DatabaseConfigService = DatabaseConfigService;
exports.DatabaseConfigService = DatabaseConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DatabaseConfigService);
//# sourceMappingURL=database.config.js.map