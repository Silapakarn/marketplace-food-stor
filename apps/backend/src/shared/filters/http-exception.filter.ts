import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? this.extractMessage(exception)
        : 'Internal server error';

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    response.status(status).json({
      code: status,
      status: 'error',
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private extractMessage(exception: HttpException): string {
    const response = exception.getResponse();
    if (typeof response === 'string') return response;
    if (typeof response === 'object' && response !== null) {
      const res = response as Record<string, unknown>;
      if (Array.isArray(res['message'])) return (res['message'] as string[]).join(', ');
      if (typeof res['message'] === 'string') return res['message'];
    }
    return exception.message;
  }
}
