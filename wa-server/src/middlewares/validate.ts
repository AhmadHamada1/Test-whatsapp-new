import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (schema && typeof schema.parse === 'function') {
        (req as any)[source] = schema.parse((req as any)[source]);
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return next({ status: 400, message: 'Validation failed', details: err.issues });
      }
      return next(err);
    }
  };
}
