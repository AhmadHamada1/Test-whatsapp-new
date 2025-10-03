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
  // // Explicit console log when a request is reached
  // app.use((req, res, next) => {
  //   // originalUrl preserves mount path
  //   console.log(`${req.id} -> ${req.method} ${req.originalUrl}`);
  //   next();
  // });
  // Log when a request is received (reached)
  // app.use(morgan(":id -> :method :url", { immediate: true }));
  // // Log when a request completes
  app.use(morgan(":id <- :method :url :status :res[content-length] - :response-time ms"));
  app.use(createCorsMiddleware());
  // Support application/x-www-form-urlencoded (e.g., Postman form-data)
  app.use(express.urlencoded({ extended: true }));
  // Support application/json
  app.use(express.json({ limit: "1mb" }));

  // Swagger first so it is always reachable
  app.get("/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  
  // Mount routes at both root and /api to avoid 404s when using /api prefix
  app.use(routes);
  app.use("/api", routes);

  // Handle 404 requests
  app.use((req, res) => {
    res.status(404).json({ error: { message: "Not Found" } });
  });

  app.use(errorHandler);
  return app;
}

module.exports = { createApp };


