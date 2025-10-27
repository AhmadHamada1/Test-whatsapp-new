"use strict";

const { logApiCall } = require("../../modules/api-call-logs/service");

function createApiLogger() {
  return async (req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;
    
    // Store response data
    let responseBody = null;
    let responseStatus = res.statusCode;
    
    // Override res.send to capture response body
    res.send = function(body) {
      responseBody = body;
      return originalSend.call(this, body);
    };
    
    // Override res.json to capture response body
    const originalJson = res.json;
    res.json = function(body) {
      responseBody = body;
      return originalJson.call(this, body);
    };
    
    // Log the API call when response is sent
    res.on('finish', async () => {
      try {
        const responseTime = Date.now() - startTime;
        
        // Only log if we have an API key (from requireApiKey middleware)
        if (req.apiKey && req.apiKey._id) {
          await logApiCall({
            apiKeyId: req.apiKey._id,
            endpoint: req.originalUrl,
            method: req.method,
            requestBody: req.body,
            responseStatus: res.statusCode,
            responseBody: responseBody,
            responseTime,
            userAgent: req.get('User-Agent'),
            ipAddress: req.ip || req.connection.remoteAddress,
            error: res.statusCode >= 400 ? responseBody?.message || 'Unknown error' : undefined
          });
        }
      } catch (error) {
        // Don't let logging errors affect the main request
        console.error('Failed to log API call:', error);
      }
    });
    
    next();
  };
}

module.exports = { createApiLogger };
