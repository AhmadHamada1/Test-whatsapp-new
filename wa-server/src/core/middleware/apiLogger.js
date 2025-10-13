"use strict";

function createApiLogger() {
  return async (req, res, next) => {
    const startTime = Date.now();
    
    // Log the API call when response is sent
    res.on('finish', async () => {
      try {
        const responseTime = Date.now() - startTime;
        
        // Simple console logging for now
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} - ${res.statusCode} (${responseTime}ms)`);
        
        // TODO: Add proper API call logging to database when needed
        // This would require the ApiCallLog model and service
      } catch (error) {
        // Don't let logging errors affect the main request
        console.error('Failed to log API call:', error);
      }
    });
    
    next();
  };
}

module.exports = { createApiLogger };