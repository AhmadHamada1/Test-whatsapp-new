import { Request, Response, NextFunction } from "express";
import { ApiError } from "../types";

interface ErrorWithStatus extends Error {
  status?: number;
  details?: Record<string, any>;
}

export function errorHandler(
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  const details = err.details;

  if (status >= 500) {
    console.error(err);
  }

  const errorResponse: ApiError = { 
    error: "Error", 
    message, 
    ...(details && { details })
  };

  res.status(status).json(errorResponse);
}
