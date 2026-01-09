"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceUnavailableException = exports.ConflictException = exports.NotFoundException = exports.AuthorizationException = exports.AuthenticationException = exports.ValidationException = void 0;
const common_1 = require("@nestjs/common");
class ValidationException extends common_1.HttpException {
    constructor(message, details) {
        super({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message,
                details,
            },
        }, common_1.HttpStatus.BAD_REQUEST);
    }
}
exports.ValidationException = ValidationException;
class AuthenticationException extends common_1.HttpException {
    constructor(message = 'Authentication failed') {
        super({
            success: false,
            error: {
                code: 'AUTHENTICATION_ERROR',
                message,
            },
        }, common_1.HttpStatus.UNAUTHORIZED);
    }
}
exports.AuthenticationException = AuthenticationException;
class AuthorizationException extends common_1.HttpException {
    constructor(message = 'Insufficient permissions') {
        super({
            success: false,
            error: {
                code: 'AUTHORIZATION_ERROR',
                message,
            },
        }, common_1.HttpStatus.FORBIDDEN);
    }
}
exports.AuthorizationException = AuthorizationException;
class NotFoundException extends common_1.HttpException {
    constructor(resource) {
        super({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message: `${resource} not found`,
            },
        }, common_1.HttpStatus.NOT_FOUND);
    }
}
exports.NotFoundException = NotFoundException;
class ConflictException extends common_1.HttpException {
    constructor(message) {
        super({
            success: false,
            error: {
                code: 'CONFLICT',
                message,
            },
        }, common_1.HttpStatus.CONFLICT);
    }
}
exports.ConflictException = ConflictException;
class ServiceUnavailableException extends common_1.HttpException {
    constructor(message = 'Service temporarily unavailable') {
        super({
            success: false,
            error: {
                code: 'SERVICE_UNAVAILABLE',
                message,
            },
        }, common_1.HttpStatus.SERVICE_UNAVAILABLE);
    }
}
exports.ServiceUnavailableException = ServiceUnavailableException;
//# sourceMappingURL=index.js.map