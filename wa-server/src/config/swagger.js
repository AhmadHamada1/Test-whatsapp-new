"use strict";

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const config = require("./env");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "WhatsApp Web Bot API",
      version: "1.0.0",
      description: "API for managing WhatsApp connections and sending messages",
      contact: {
        name: "WhatsApp Bot Support",
        email: "support@whatsappbot.com"
      },
      license: {
        name: "UNLICENSED"
      }
    },
    servers: [
      {
        url: `http://localhost:${config.PORT}`,
        description: "Development server"
      },
      {
        url: "https://wa-server.yourdomain.com",
        description: "Production server"
      }
    ],
    components: {
      securitySchemes: {
        apiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "API key for authentication"
        }
      },
      schemas: {}
    }
  },
  apis: [
    "./src/modules/**/*.js",
  ]
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi,
  swaggerOptions: {
    explorer: true,
    swaggerOptions: {
      docExpansion: "none",
      filter: true,
      showRequestHeaders: true,
      showCommonExtensions: true,
      tryItOutEnabled: true
    }
  }
};
