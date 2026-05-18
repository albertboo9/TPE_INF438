export class ApiResponse<T> {
  public readonly success: boolean;
  public readonly data: T;
  public readonly timestamp: string;
  public readonly version: string = '1.0.0';

  constructor(data: T) {
    this.success = true;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static ok<T>(data: T): ApiResponse<T> {
    return new ApiResponse<T>(data);
  }
}

export class PaginatedApiResponse<T> {
  public readonly success: boolean;
  public readonly data: T[];
  public readonly pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  public readonly timestamp: string;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.success = true;
    this.data = data;
    this.pagination = {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
    this.timestamp = new Date().toISOString();
  }
}

export class ErrorResponse {
  public readonly success: boolean;
  public readonly error: {
    code: string;
    message: string;
    details?: unknown;
  };
  public readonly timestamp: string;

  constructor(code: string, message: string, details?: unknown) {
    this.success = false;
    this.error = { code, message, details };
    this.timestamp = new Date().toISOString();
  }
}