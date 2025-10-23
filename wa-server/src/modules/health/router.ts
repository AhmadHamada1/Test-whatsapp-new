import { Router, Request, Response } from "express";
import mongoose from "mongoose";

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: System health check
 *     description: Checks if the system, including the database, is healthy
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Database is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 database:
 *                   type: string
 *                   example: "connected"
 *                 responseTime:
 *                   type: number
 *                   example: 45
 *       503:
 *         description: Database is unhealthy
 */
router.get("/", async (req: Request, res: Response) => {
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
});

export default router;
