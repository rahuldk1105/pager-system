import { HttpException } from '@nestjs/common';
export declare class ValidationException extends HttpException {
    constructor(message: string, details?: any);
}
export declare class AuthenticationException extends HttpException {
    constructor(message?: string);
}
export declare class AuthorizationException extends HttpException {
    constructor(message?: string);
}
export declare class NotFoundException extends HttpException {
    constructor(resource: string);
}
export declare class ConflictException extends HttpException {
    constructor(message: string);
}
export declare class ServiceUnavailableException extends HttpException {
    constructor(message?: string);
}
