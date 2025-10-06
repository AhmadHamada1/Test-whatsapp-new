"use strict";

const swaggerJsdoc = require("swagger-jsdoc");

// WhatsApp API Swagger Definition
const swaggerDefinitionWa = {
  openapi: "3.0.0",
  info: {
    title: "WhatsApp API",
    version: "1.0.0",
    description: "WhatsApp Web.js wrapper API for sending messages and managing connections"
  },
  servers: [
    { url: "http://localhost:4000" },
    { url: "https://whatsapp-webjs-wrapper-bot-server.chillkro.com" }
  ],
  components: {
    securitySchemes: {
      apiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "x-api-key",
        description: "API key for WhatsApp API authentication"
      },
    },
  },
  security: [{ apiKeyAuth: [] }],
};

// Options for WhatsApp API
const optionsWa = {
  swaggerDefinition: swaggerDefinitionWa,
  apis: [
    "src/modules/wa/**/*.js",
  ],
};

// Generate Swagger spec
const swaggerSpecWa = swaggerJsdoc(optionsWa);

module.exports = { swaggerSpecWa };
