import { Request, Response } from "express";
import mongoose from "mongoose";

export const healthCheckWithDatabase = async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    // Check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        status: "unhealthy",
        database: "disconnected",
        error: "Database not connected"
      });
    }

    // Ping the database to check connectivity
    if (mongoose.connection.db) {
      await mongoose.connection.db.admin().ping();
    } else {
      throw new Error("Database connection not available");
    }

    const responseTime = Date.now() - startTime;

    res.json({
      status: "healthy",
      database: "connected",
      responseTime: responseTime,
      readyState: mongoose.connection.readyState
    });
  } catch (error) {
    const responseTime = Date.now() - startTime;

    res.status(503).json({
      status: "unhealthy",
      database: "error",
      responseTime: responseTime,
      error: error instanceof Error ? error.message : "Unknown database error"
    });
  }
}

export const healthCheckWithApiKey = async (req: Request, res: Response) => {
  res.json({ status: "healthy" });
}
