"use strict";

const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("./config/cors");
const { errorHandler } = require("./middleware/errorHandler");
const { specs, swaggerUi, swaggerOptions } = require("./config/swagger");
const routes = require("./routes");

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors);

// Logging middleware
app.use(morgan("combined"));

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Swagger documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// Routes
app.use("/", routes);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
