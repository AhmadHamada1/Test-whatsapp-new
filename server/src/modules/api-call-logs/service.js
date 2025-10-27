"use strict";

const { ApiCallLog } = require("./model");

async function logApiCall(logData) {
  const {
    apiKeyId,
    endpoint,
    method,
    requestBody,
    responseStatus,
    responseBody,
    responseTime,
    userAgent,
    ipAddress,
    error
  } = logData;

  const log = new ApiCallLog({
    apiKey: apiKeyId,
    endpoint,
    method,
    requestBody: requestBody ? sanitizeRequestBody(requestBody) : undefined,
    responseStatus,
    responseBody: responseBody ? sanitizeResponseBody(responseBody) : undefined,
    responseTime,
    userAgent,
    ipAddress,
    error
  });

  await log.save();
  return log;
}

async function getApiCallLogs(apiKeyId, options = {}) {
  const {
    limit = 50,
    offset = 0,
    endpoint,
    method,
    responseStatus,
    startDate,
    endDate
  } = options;

  const query = { apiKey: apiKeyId };

  if (endpoint) query.endpoint = new RegExp(endpoint, 'i');
  if (method) query.method = method;
  if (responseStatus) query.responseStatus = responseStatus;
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  const logs = await ApiCallLog.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset)
    .lean();

  const total = await ApiCallLog.countDocuments(query);

  return { logs, total, limit, offset };
}

async function getApiCallStats(apiKeyId, options = {}) {
  const { startDate, endDate } = options;
  
  const matchQuery = { apiKey: apiKeyId };
  if (startDate || endDate) {
    matchQuery.createdAt = {};
    if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
    if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
  }

  const stats = await ApiCallLog.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: null,
        totalCalls: { $sum: 1 },
        successCalls: {
          $sum: { $cond: [{ $gte: ["$responseStatus", 200] }, 1, 0] }
        },
        errorCalls: {
          $sum: { $cond: [{ $lt: ["$responseStatus", 200] }, 1, 0] }
        },
        avgResponseTime: { $avg: "$responseTime" },
        endpoints: {
          $push: {
            endpoint: "$endpoint",
            method: "$method",
            status: "$responseStatus"
          }
        }
      }
    }
  ]);

  return stats[0] || {
    totalCalls: 0,
    successCalls: 0,
    errorCalls: 0,
    avgResponseTime: 0,
    endpoints: []
  };
}

function sanitizeRequestBody(body) {
  // Remove sensitive data from request body
  if (typeof body === 'object' && body !== null) {
    const sanitized = { ...body };
    // Remove common sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.apiKey;
    delete sanitized.secret;
    return sanitized;
  }
  return body;
}

function sanitizeResponseBody(body) {
  // Remove sensitive data from response body
  if (typeof body === 'object' && body !== null) {
    const sanitized = { ...body };
    // Remove common sensitive fields
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.apiKey;
    delete sanitized.secret;
    delete sanitized.qr; // Don't log QR codes
    return sanitized;
  }
  return body;
}

module.exports = {
  logApiCall,
  getApiCallLogs,
  getApiCallStats
};
