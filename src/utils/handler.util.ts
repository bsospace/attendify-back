import { Request, Response, NextFunction } from 'express';

export class HttpError extends Error {
  public status: number;
  public details?: any;

  constructor(status: number, message: string, details?: any) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const errorHandler = (
  err: HttpError | Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err instanceof HttpError ? err.status : 500;
  const message = err.message || 'Internal Server Error';
  const details = err instanceof HttpError && err.details ? err.details : null;

  res.status(statusCode).json({
    success: false,
    message,
    error: details,
  });
};