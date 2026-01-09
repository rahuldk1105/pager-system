import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { method, url, ip } = request;
    const userAgent = request.get('User-Agent') || '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const { statusCode } = response;
        const contentLength = response.get('Content-Length') || 0;
        const duration = Date.now() - startTime;

        this.logger.log(
          `${method} ${url} ${statusCode} ${contentLength} - ${duration}ms`,
          {
            method,
            url,
            statusCode,
            contentLength,
            duration,
            ip,
            userAgent: userAgent.substring(0, 200), // Truncate long user agents
          },
        );
      }),
    );
  }
}