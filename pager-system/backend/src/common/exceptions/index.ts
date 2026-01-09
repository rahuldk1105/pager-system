import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(message: string, details?: any) {
    super(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message,
          details,
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class BadRequestException extends HttpException {
  constructor(message: string, code: string = 'BAD_REQUEST') {
    super(
      {
        success: false,
        error: {
          code,
          message,
        },
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class AuthenticationException extends HttpException {
  constructor(message: string = 'Authentication failed') {
    super(
      {
        success: false,
        error: {
          code: 'AUTHENTICATION_ERROR',
          message,
        },
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}

export class AuthorizationException extends HttpException {
  constructor(message: string = 'Insufficient permissions') {
    super(
      {
        success: false,
        error: {
          code: 'AUTHORIZATION_ERROR',
          message,
        },
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

export class NotFoundException extends HttpException {
  constructor(resource: string) {
    super(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `${resource} not found`,
        },
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

export class ConflictException extends HttpException {
  constructor(message: string) {
    super(
      {
        success: false,
        error: {
          code: 'CONFLICT',
          message,
        },
      },
      HttpStatus.CONFLICT,
    );
  }
}

export class ServiceUnavailableException extends HttpException {
  constructor(message: string = 'Service temporarily unavailable') {
    super(
      {
        success: false,
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message,
        },
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}