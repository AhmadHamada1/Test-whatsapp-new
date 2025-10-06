"use strict";

const { checkApiKeyHealth, getSystemHealth } = require("./service");

async function healthCheckHandler(req, res, next) {
  try {
    const result = await checkApiKeyHealth(req.apiKey._id);
    
    // Set appropriate HTTP status code based on health status
    let httpStatus = 200;
    if (result.status === "unhealthy" || result.status === "error") {
      httpStatus = 503; // Service Unavailable
    } else if (result.status === "pending" || result.status === "disconnected") {
      httpStatus = 202; // Accepted but not ready
    }
    
    res.status(httpStatus).json({
      ok: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

async function systemHealthHandler(req, res, next) {
  try {
    const result = await getSystemHealth();
    
    // Set appropriate HTTP status code
    const httpStatus = result.status === "healthy" ? 200 : 503;
    
    res.status(httpStatus).json({
      ok: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  healthCheckHandler,
  systemHealthHandler
};
