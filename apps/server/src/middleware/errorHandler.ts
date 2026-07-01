import { Request, Response, NextFunction } from 'express';
import pino from 'pino';

const logger = pino();

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error({
    err,
    url: req.url,
    method: req.method,
    userId: (req as any).user?.id,
  });

  if (res.headersSent) return;

  const status = (err as any).status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production'
      ? 'An internal error occurred'
      : err.message,
  });
}
