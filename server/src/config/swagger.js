"use strict";

const swaggerJsdoc = require("swagger-jsdoc");

// API Swagger Definition
const swaggerDefinition = {
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

// Options for API
const options = {
  swaggerDefinition: swaggerDefinition,
  apis: [
    "src/modules/**/*.js",
    "src/routes.js",
  ],
};

// Generate Swagger spec
const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };
