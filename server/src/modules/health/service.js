"use strict";

const { WaConnection } = require("../wa/model");

async function checkApiKeyHealth(apiKeyId) {
  try {
    // Check if API key has any connections
    const connections = await WaConnection.find({ apiKey: apiKeyId });
    
    // Count connections by status
    const statusCounts = {
      ready: 0,
      pending: 0,
      disconnected: 0
    };
    
    connections.forEach(conn => {
      statusCounts[conn.status] = (statusCounts[conn.status] || 0) + 1;
    });
    
    // Determine overall health status
    let healthStatus = "unhealthy";
    let message = "No WhatsApp connections found";
    
    if (statusCounts.ready > 0) {
      healthStatus = "healthy";
      message = `API key is working. ${statusCounts.ready} connection(s) ready`;
    } else if (statusCounts.pending > 0) {
      healthStatus = "pending";
      message = `API key is valid but ${statusCounts.pending} connection(s) pending setup`;
    } else if (statusCounts.disconnected > 0) {
      healthStatus = "disconnected";
      message = `API key is valid but ${statusCounts.disconnected} connection(s) disconnected`;
    }
    
    return {
      status: healthStatus,
      message,
      timestamp: new Date().toISOString(),
      connections: {
        total: connections.length,
        ready: statusCounts.ready,
        pending: statusCounts.pending,
        disconnected: statusCounts.disconnected
      },
      apiKey: {
        id: apiKeyId,
        valid: true
      }
    };
  } catch (error) {
    return {
      status: "error",
      message: "Failed to check API key health",
      timestamp: new Date().toISOString(),
      error: error.message,
      apiKey: {
        id: apiKeyId,
        valid: false
      }
    };
  }
}

async function getSystemHealth() {
  try {
    // Basic system health check
    const startTime = Date.now();
    
    // Check database connection (simple query)
    await WaConnection.findOne().limit(1);
    const dbResponseTime = Date.now() - startTime;
    
    return {
      status: "healthy",
      message: "System is operational",
      timestamp: new Date().toISOString(),
      services: {
        database: {
          status: "healthy",
          responseTime: `${dbResponseTime}ms`
        },
        api: {
          status: "healthy",
          version: "1.0.0"
        }
      }
    };
  } catch (error) {
    return {
      status: "unhealthy",
      message: "System health check failed",
      timestamp: new Date().toISOString(),
      error: error.message,
      services: {
        database: {
          status: "unhealthy",
          error: error.message
        }
      }
    };
  }
}

module.exports = {
  checkApiKeyHealth,
  getSystemHealth
};
