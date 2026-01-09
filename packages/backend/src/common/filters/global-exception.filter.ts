import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let details: any = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const responseObj = exceptionResponse as any;
        if (responseObj.error) {
          code = responseObj.error.code || code;
          message = responseObj.error.message || message;
          details = responseObj.error.details;
        } else {
          message = responseObj.message || message;
        }
      } else {
        message = exceptionResponse as string;
      }
    } else if (exception instanceof QueryFailedError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'DATABASE_ERROR';
      message = 'Database operation failed';
      details = { constraint: (exception as any).constraint };
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log error with context
    this.logger.error(
      `${request.method} ${request.url} - ${status} ${code}`,
      {
        exception: exception instanceof Error ? exception.stack : String(exception),
        request: {
          method: request.method,
          url: request.url,
          ip: request.ip,
          userAgent: request.get('User-Agent'),
          body: this.sanitizeRequestBody(request.body),
        },
        response: {
          status,
          code,
          message,
        },
      },
    );

    const errorResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
        ...(process.env.NODE_ENV === 'development' && {
          stack: exception instanceof Error ? exception.stack : undefined,
        }),
      },
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }

  private sanitizeRequestBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sanitized = { ...body };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'token', 'refreshToken', 'secret'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }
}