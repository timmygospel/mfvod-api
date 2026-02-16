export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    requestId?: string;
  };
}

export interface SuccessResponse<T> {
  data: T;
}
