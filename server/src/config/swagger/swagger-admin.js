"use strict";

const swaggerJsdoc = require("swagger-jsdoc");

// Admin API Swagger Definition
const swaggerDefinitionAdmin = {
  openapi: "3.0.0",
  info: {
    title: "Admin API",
    version: "1.0.0",
    description: "Admin API for managing API keys, users, and system administration"
  },
  servers: [
    { url: "http://localhost:4000" },
    { url: "https://whatsapp-webjs-wrapper-bot-server.chillkro.com" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT token for admin authentication"
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

// Options for Admin API
const optionsAdmin = {
  swaggerDefinition: swaggerDefinitionAdmin,
  apis: [
    "src/modules/admin/**/*.js",
    "src/modules/api-keys/**/*.js",
    "src/modules/auth/**/*.js",
    "src/modules/api-call-logs/**/*.js",
    "src/routes.js",
  ],
};

// Generate Swagger spec
const swaggerSpecAdmin = swaggerJsdoc(optionsAdmin);

module.exports = { swaggerSpecAdmin };
