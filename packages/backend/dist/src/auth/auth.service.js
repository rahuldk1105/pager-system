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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const users_service_1 = require("../users/users.service");
const user_entity_1 = require("../users/user.entity");
const exceptions_1 = require("../common/exceptions");
let AuthService = AuthService_1 = class AuthService {
    constructor(usersService, jwtService, configService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.configService = configService;
        this.logger = new common_1.Logger(AuthService_1.name);
    }
    async login(loginDto) {
        var _a;
        try {
            if (!loginDto.email || !loginDto.password) {
                throw new exceptions_1.ValidationException('Email and password are required');
            }
            const user = await this.usersService.findByEmail(loginDto.email);
            if (!user) {
                this.logger.warn(`Login attempt for non-existent user: ${loginDto.email}`);
                throw new exceptions_1.AuthenticationException('Invalid credentials');
            }
            if (user.status !== user_entity_1.UserStatus.ACTIVE) {
                this.logger.warn(`Login attempt for inactive account: ${user.email}, status: ${user.status}`);
                throw new exceptions_1.AuthenticationException('Account is not active');
            }
            const isPasswordValid = await this.usersService.validatePassword(user, loginDto.password);
            if (!isPasswordValid) {
                this.logger.warn(`Invalid password for user: ${user.email}`);
                throw new exceptions_1.AuthenticationException('Invalid credentials');
            }
            if (!loginDto.deviceId || loginDto.deviceId.length < 10) {
                throw new exceptions_1.ValidationException('Valid device ID is required');
            }
            const tokens = await this.generateTokens(user, loginDto.deviceId);
            this.logger.log(`User logged in: ${user.email}, device: ${loginDto.deviceId}`);
            return {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    roles: ((_a = user.roles) === null || _a === void 0 ? void 0 : _a.map(r => r.role)) || [],
                },
                tokens,
            };
        }
        catch (error) {
            if (error instanceof exceptions_1.AuthenticationException || error instanceof exceptions_1.ValidationException) {
                throw error;
            }
            this.logger.error(`Login error for ${loginDto.email}:`, error);
            throw new exceptions_1.AuthenticationException('Authentication service temporarily unavailable');
        }
    }
    async validateUser(email, password) {
        try {
            const user = await this.usersService.findByEmail(email);
            if (!user) {
                return null;
            }
            const isPasswordValid = await this.usersService.validatePassword(user, password);
            return isPasswordValid ? user : null;
        }
        catch (error) {
            this.logger.error(`User validation error for ${email}:`, error);
            return null;
        }
    }
    async generateTokens(user, deviceId) {
        var _a;
        const payload = {
            sub: user.id,
            email: user.email,
            roles: ((_a = user.roles) === null || _a === void 0 ? void 0 : _a.map(r => r.role)) || [],
            deviceId,
        };
        try {
            const accessToken = this.jwtService.sign(payload, {
                expiresIn: this.configService.get('JWT_ACCESS_EXPIRES', '15m'),
            });
            const refreshToken = this.jwtService.sign({
                sub: user.id,
                deviceId,
                tokenVersion: 1,
            }, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRES', '7d'),
            });
            return {
                accessToken,
                refreshToken,
                expiresIn: 15 * 60,
                tokenType: 'Bearer',
            };
        }
        catch (error) {
            this.logger.error(`Token generation error for user ${user.id}:`, error);
            throw new exceptions_1.AuthenticationException('Token generation failed');
        }
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map