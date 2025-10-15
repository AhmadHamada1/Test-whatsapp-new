import express, { Application } from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "./config/cors";
import { errorHandler } from "./middlewares/errorHandler";
import { specs, swaggerUi, swaggerOptions } from "./config/swagger";
import mainRouter from "./router";

const app: Application = express();

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
app.use("/docs", swaggerUi.serve);
app.get("/docs/swagger.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(specs);
});
app.use("/docs", swaggerUi.setup(specs, swaggerOptions));

// Routes
app.use("/", mainRouter);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;
