"use strict";

const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const { nanoid } = require("nanoid");
const { createCorsMiddleware } = require("./config/cors");
const routes = require("./routes");
const { errorHandler } = require("./core/middleware/errorHandler");
const swaggerUi = require("swagger-ui-express");
const { swaggerSpec } = require("./config/swagger");

function setupSwaggerDocs(app) {
  // Merge both API specs into one
  const mergedSpec = {
    openapi: "3.0.0",
    info: {
      title: "WhatsApp Bot API",
      version: "1.0.0",
      description: "Complete API documentation for WhatsApp Bot - includes Admin management and monitoring APIs"
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
      }
    },
    tags: [
      {
        name: "Admin",
        description: "Admin API for managing API keys, users, and system administration"
      },
      {
        name: "Health",
        description: "Health check endpoints"
      }
    ],
    paths: {
      ...swaggerSpec.paths,
    }
  };

  // Single Swagger UI endpoint
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(mergedSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "WhatsApp Bot API Documentation"
  }));
}

function createApp() {
  const app = express();
  // app.set("trust proxy", 1);

  app.use(helmet());

  // Attach a short request id for correlation
  morgan.token("id", (req) => req.id);
  app.use((req, res, next) => {
    req.id = nanoid(8);
    next();
  });

  // // Log when a request completes
  app.use(morgan(":id <- :method :url :status :res[content-length] - :response-time ms"));
  app.use(createCorsMiddleware());

  // Support application/x-www-form-urlencoded (e.g., Postman form-data)
  app.use(express.urlencoded({ extended: true }));

  // Support application/json
  app.use(express.json({ limit: "1mb" }));

  // Setup Swagger documentation
  setupSwaggerDocs(app);

  // Mount routes at both root and /api to avoid 404s when using /api prefix
  app.use(routes);

  // Handle 404 requests
  app.use((req, res) => {
    res.status(404).json({ error: { message: "Not Found" } });
  });

  app.use(errorHandler);
  return app;
}

module.exports = { createApp };


