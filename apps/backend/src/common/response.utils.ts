import { ApiSuccessResponse } from '../../src/types/api-response.type.js';

export interface PaginationOptions {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  totalPages: number;
  isNextPage: boolean;
  isPreviousPage: boolean;
}

export class ResponseUtils {
  static success<T>(
    data: T,
    message = 'Success',
  ): Omit<ApiSuccessResponse<T>, 'meta'> {
    return {
      success: true,
      message,
      data,
    };
  }

  static paginated<T>(
    items: T[],
    options: PaginationOptions,
    message = 'Success',
  ): Omit<ApiSuccessResponse<PaginatedResult<T>>, 'meta'> {
    const { page, limit, total } = options;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      message,
      data: {
        items,
        page,
        limit,
        totalPages,
        isNextPage: page < totalPages,
        isPreviousPage: page > 1,
      },
    };
  }
}
