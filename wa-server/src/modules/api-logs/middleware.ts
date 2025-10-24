import { Request, Response, NextFunction } from 'express';
import { ApiLogsService } from './service';
import { AuthenticatedRequest } from '../../types';

export const apiLoggingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const originalSend = res.send;

  // Capture request data
  const requestData = {
    endpoint: req.path,
    method: req.method as 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    requestBody: req.method !== 'GET' ? req.body : undefined,
    userAgent: req.get('User-Agent'),
    ipAddress: req.ip || req.socket.remoteAddress || (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.headers['x-real-ip'] as string
  };

  // Override res.send to capture response data
  res.send = function (body: any) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Get API key ID if available (from authenticated requests)
    const apiKeyId = (req as AuthenticatedRequest).apiKey?._id?.toString();

    // Only log if we have an API key (authenticated requests)
    if (apiKeyId) {
      // Log asynchronously to avoid blocking the response
      setImmediate(async () => {
        try {
          const logData: any = {
            apiKey: apiKeyId,
            endpoint: requestData.endpoint,
            method: requestData.method,
            responseStatus: res.statusCode,
            responseTime
          };

          // Add optional fields only if they exist
          if (requestData.requestBody !== undefined) {
            logData.requestBody = requestData.requestBody;
          }
          if (res.statusCode >= 400) {
            logData.responseBody = body;
          }
          if (requestData.userAgent) {
            logData.userAgent = requestData.userAgent;
          }
          if (requestData.ipAddress) {
            logData.ipAddress = requestData.ipAddress;
          }
          if (res.statusCode >= 400) {
            logData.error = `HTTP ${res.statusCode}`;
          }

          await ApiLogsService.createLog(logData);
        } catch (error) {
          console.error('Error logging API call:', error);
          // Don't throw error to avoid breaking the API response
        }
      });
    }

    // Call original send method
    return originalSend.call(this, body);
  };

  next();
};
