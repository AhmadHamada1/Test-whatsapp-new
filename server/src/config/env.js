"use strict";

function parseNumber(value, defaultValue) {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: parseNumber(process.env.PORT, 4000),
  MONGODB_URI: process.env.MONGODB_URI || "",
  SESSION_SECRET: process.env.SESSION_SECRET || "change-me",
  JWT_SECRET: process.env.JWT_SECRET || "change-me-jwt",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  DASHBOARD_ORIGIN: process.env.DASHBOARD_ORIGIN || "",
};

module.exports = config;
