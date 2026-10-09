export type ApiSuccessResponse<T = any> = {
  success: true;
  message: string;
  meta?: {
    timestamp: string;
    path: string;
    method: string;
    page?: number;
    limit?: number;
    totalPages?: number;
    isNextPage?: boolean;
    isPreviousPage?: boolean;
  };
  data: T;
};

export type ApiErrorResponse<T = any> = {
  success: false;
  message: string;
  meta?: {
    timestamp: string;
    path: string;
    method: string;
  };
  data?: T;
};
