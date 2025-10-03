"use strict";

const swaggerJsdoc = require("swagger-jsdoc");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Whatsapp Wrapper API",
    version: "1.0.0",
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
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const options = {
  swaggerDefinition,
  apis: [
    "src/modules/**/*.js",
    "src/routes.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = { swaggerSpec };


