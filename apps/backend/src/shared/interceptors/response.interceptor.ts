import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  code: number;
  status: string;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    const response = context.switchToHttp().getResponse();
    const statusCode = response.statusCode || 200;
    
    return next.handle().pipe(
      map(data => ({
        code: statusCode,
        status: this.getStatusText(statusCode),
        message: this.getMessage(context, statusCode),
        data,
      })),
    );
  }

  private getStatusText(statusCode: number): string {
    const statusMap: Record<number, string> = {
      200: 'OK',
      201: 'Created',
      202: 'Accepted',
      204: 'No Content',
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      500: 'Internal Server Error',
    };
    
    return statusMap[statusCode] || 'Unknown';
  }

  private getMessage(context: ExecutionContext, statusCode: number): string {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;

    const pathSegments = url.split('/').filter(Boolean);
    const resource = pathSegments[pathSegments.length - 1] || 'resource';

    const messageMap: Record<string, Record<number, string>> = {
      GET: {
        200: `${this.capitalizeFirst(resource)} retrieved successfully`,
        404: `${this.capitalizeFirst(resource)} not found`,
      },
      POST: {
        201: `${this.capitalizeFirst(resource)} created successfully`,
        400: `Invalid ${resource} data provided`,
      },
      PUT: {
        200: `${this.capitalizeFirst(resource)} updated successfully`,
        404: `${this.capitalizeFirst(resource)} not found`,
      },
      DELETE: {
        200: `${this.capitalizeFirst(resource)} deleted successfully`,
        404: `${this.capitalizeFirst(resource)} not found`,
      },
    };

    return messageMap[method]?.[statusCode] || 'Operation completed';
  }

  private capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}