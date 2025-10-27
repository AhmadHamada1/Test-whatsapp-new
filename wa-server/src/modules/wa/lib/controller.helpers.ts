import { Response } from "express";
import { ApiResponse, Connection } from "../../../types";
import { IConnection } from "../model";

/**
 * Extract API key ID from authenticated request
 */
export const getApiKeyId = (req: any): string => {
  if (!req.apiKey || !req.apiKey._id) {
    throw new Error("API key not found in request");
  }
  return req.apiKey._id.toString();
};

/**
 * Transform IConnection to Connection type for API response
 */
export const transformConnection = (connection: IConnection): Connection => {
  const result: Connection = {
    connectionId: (connection._id as any).toString(),
    status: connection.status,
    createdAt: connection.createdAt
  };

  if (connection.qrCode) {
    result.qrCode = connection.qrCode;
  }

  if (connection.lastActivity) {
    result.lastActivity = connection.lastActivity;
  }

  if (connection.name) {
    result.name = connection.name;
  }

  return result;
};

/**
 * Send success response
 */
export const sendSuccess = <T>(
  res: Response<ApiResponse<T>>,
  message: string,
  data: T
): void => {
  res.json({
    success: true,
    message,
    data
  });
};

/**
 * Send error response
 */
export const sendError = (
  res: Response<ApiResponse>,
  statusCode: number,
  message: string,
  details?: Record<string, any>
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    data: details
  });
};

/**
 * Validate connection ID parameter
 */
export const validateConnectionId = (
  connectionId: string | undefined,
  res: Response<ApiResponse>
): connectionId is string => {
  if (!connectionId) {
    sendError(res, 400, "Connection ID is required");
    return false;
  }
  
  if (typeof connectionId !== 'string' || connectionId.trim().length === 0) {
    sendError(res, 400, "Invalid connection ID format");
    return false;
  }
  
  return true;
};

/**
 * Handle connection not found scenario
 */
export const handleConnectionNotFound = (
  connection: IConnection | null,
  res: Response<ApiResponse>
): connection is IConnection => {
  if (!connection) {
    sendError(res, 404, "Connection not found");
    return false;
  }
  return true;
};

/**
 * Handle service errors with proper logging and response
 */
export const handleServiceError = (
  error: unknown,
  res: Response<ApiResponse>,
  operation: string
): void => {
  console.error(`Error during ${operation}:`, error);
  
  const errorMessage = error instanceof Error 
    ? error.message 
    : `An unexpected error occurred during ${operation}`;
  
  // Check if it's a validation error
  if (error instanceof Error && error.message.includes('validation')) {
    sendError(res, 400, errorMessage);
    return;
  }
  
  // Check if it's a not found error
  if (error instanceof Error && error.message.includes('not found')) {
    sendError(res, 404, errorMessage);
    return;
  }
  
  // Check if it's a duplicate key error
  if (error instanceof Error && error.message.includes('duplicate key')) {
    sendError(res, 409, errorMessage);
    return;
  }
  
  // Default to 500 for unexpected errors
  sendError(res, 500, errorMessage);
};

/**
 * Validate request body for required fields
 */
export const validateRequestBody = (
  body: any,
  requiredFields: string[],
  res: Response<ApiResponse>
): boolean => {
  const missingFields = requiredFields.filter(field => 
    !body[field] || (typeof body[field] === 'string' && body[field].trim().length === 0)
  );
  
  if (missingFields.length > 0) {
    sendError(res, 400, `Missing required fields: ${missingFields.join(', ')}`);
    return false;
  }
  
  return true;
};

/**
 * Sanitize string input to prevent injection attacks
 */
export const sanitizeString = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

/**
 * Generate a unique connection ID
 */
export const generateConnectionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return `conn_${timestamp}_${random}`;
};

/**
 * Validate connection status
 */
export const isValidConnectionStatus = (status: string): status is Connection['status'] => {
  return ['ready', 'needs_restore', 'disconnected', 'expired'].includes(status);
};

/**
 * Validate message type
 */
export const isValidMessageType = (type: string): boolean => {
  return ['text', 'image', 'document', 'audio', 'video'].includes(type);
};

/**
 * Validate phone number format (basic validation)
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  // Basic phone number validation - can be enhanced based on requirements
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Format error message for logging
 */
export const formatErrorForLogging = (error: unknown, context: string): string => {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const stack = error instanceof Error ? error.stack : 'No stack trace available';
  
  return `[${timestamp}] ${context}: ${errorMessage}\nStack: ${stack}`;
};
