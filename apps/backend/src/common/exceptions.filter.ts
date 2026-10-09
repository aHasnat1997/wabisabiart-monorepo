import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import type { AbstractHttpAdapter } from '@nestjs/core';
import type { Request, Response } from 'express';
import { ApiErrorResponse } from '../../src/types/api-response.type.js';
import { ZodValidationException } from 'nestjs-zod';
import { Prisma } from '@wabisabiart/db';
import { join } from 'node:path';

@Catch()
export class ExceptionsFilter implements ExceptionFilter<unknown> {
  private readonly logger = new Logger(ExceptionsFilter.name);

  constructor(
    private readonly httpAdapter: AbstractHttpAdapter<any, any, any>,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const httpContext = host.switchToHttp();
    const response = httpContext.getResponse<Response>();
    const request = httpContext.getRequest<Request>();

    const requestUrl = this.httpAdapter.getRequestUrl(request) as string;
    const requestMethod = this.httpAdapter.getRequestMethod(request) as string;

    // Handle 404 for non-API routes - serve React SPA
    if (
      exception instanceof NotFoundException &&
      !requestUrl.startsWith('/api/')
    ) {
      const adminDashboardPath = join(process.cwd(), 'admin-dashboard', 'dist');
      return response.sendFile(join(adminDashboardPath, 'index.html'));
    }

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong';
    let errors: any = undefined;

    // Handle Zod validation errors
    if (exception instanceof ZodValidationException) {
      status = HttpStatus.BAD_REQUEST;
      const zodErrors = exception.getZodError() as {
        issues: Array<{ path: (string | number)[]; message: string }>;
      };
      message = zodErrors.issues?.[0]?.message || 'Validation failed';
      errors = zodErrors.issues?.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));
    }

    // Handle Prisma errors
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;

      if (exception.code === 'P2002') {
        const target = (exception.meta?.target as string[]) || [];
        message =
          target.length > 0
            ? `${target.join(', ')} already exists`
            : 'Record already exists';
      } else if (exception.code === 'P2025') {
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
      } else if (exception.code === 'P2003') {
        message = 'Foreign key constraint failed';
      } else {
        message = exception.message.split('\n').pop() || 'Database error';
      }
    }
    // Handle HTTP exceptions
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (isRecord(exceptionResponse)) {
        if ('message' in exceptionResponse) {
          message = (exceptionResponse.message as string) || message;
        }
        if ('errors' in exceptionResponse) {
          errors = exceptionResponse.errors;
        }
      }
    }
    // Handle generic errors
    else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message;
    }

    // Logging
    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${requestMethod}] ${requestUrl} - ${message}`,
        exception instanceof Error
          ? exception.stack
          : JSON.stringify(exception),
      );
    } else if (status >= HttpStatus.BAD_REQUEST) {
      this.logger.warn(`[${requestMethod}] ${requestUrl} - ${message}`);
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      message,
      meta: {
        timestamp: new Date().toISOString(),
        path: requestUrl,
        method: requestMethod,
      },
      data: errors as Record<string, unknown>[],
    };

    if (message === 'Session revoked') {
      response.clearCookie(process.env.ACCESS_TOKEN_COOKIE_NAME as string, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/',
      });
    }

    this.httpAdapter.reply(response, errorResponse, status);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
