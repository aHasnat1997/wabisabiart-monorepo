import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Request, Response } from 'express';
import { ApiSuccessResponse } from '../types/api-response.type.js';

export interface PaginatedData<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export interface ResponseWithStatus<T> {
  data: T;
  statusCode?: number;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiSuccessResponse<T>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data: T) => {
        let actualData: T = data;
        let customMessage = 'Request successful';

        // Extract custom message and data
        if (this.hasCustomMessage(data)) {
          customMessage = data.message;
          actualData = data.data as T;
        }

        // Check if data contains custom status code
        if (this.isResponseWithStatus(data)) {
          response.status(data.statusCode as number);
          actualData = data.data as T;
        }

        // Check if data is paginated
        if (this.isPaginatedData(actualData)) {
          const totalPages = Math.ceil(actualData.total / actualData.limit);

          return {
            success: true,
            message: customMessage,
            meta: {
              timestamp: new Date().toISOString(),
              path: request.url,
              method: request.method,
              page: actualData.page,
              limit: actualData.limit,
              totalData: actualData.total,
              totalPages,
              isNextPage: actualData.page < totalPages,
              isPreviousPage: actualData.page > 1,
            },
            data: actualData.items as T,
          };
        }

        return {
          success: true,
          message: customMessage,
          meta: {
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
          },
          data: actualData,
        };
      }),
    );
  }

  private hasCustomMessage(
    data: unknown,
  ): data is { message: string; data: any } {
    return (
      data !== null &&
      typeof data === 'object' &&
      'message' in data &&
      'data' in data &&
      typeof (data as any).message === 'string'
    );
  }

  private isResponseWithStatus(
    data: unknown,
  ): data is ResponseWithStatus<unknown> {
    return (
      data !== null &&
      typeof data === 'object' &&
      'data' in data &&
      'statusCode' in data &&
      typeof (data as ResponseWithStatus<unknown>).statusCode === 'number'
    );
  }

  private isPaginatedData(data: unknown): data is PaginatedData<unknown> {
    return (
      data !== null &&
      typeof data === 'object' &&
      'items' in data &&
      'page' in data &&
      'limit' in data &&
      'total' in data &&
      Array.isArray((data as PaginatedData<unknown>).items) &&
      typeof (data as PaginatedData<unknown>).page === 'number' &&
      typeof (data as PaginatedData<unknown>).limit === 'number' &&
      typeof (data as PaginatedData<unknown>).total === 'number'
    );
  }
}
