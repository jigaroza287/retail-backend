export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;

  constructor(message: string, statusCode = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class InsufficientStockError extends ApiError {
  constructor(message = "Insufficient stock available") {
    super(message, 409, "INSUFFICIENT_STOCK");
  }
}
