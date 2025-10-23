import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { requireApiKey } from "../../middlewares/requireApiKey";
import { healthCheckWithApiKey, healthCheckWithDatabase } from "./controller";

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
router.get("/", healthCheckWithDatabase);

/**
 * @swagger
 * /health/api-key:
 *   get:
 *     summary: Check API key health
 *     description: Checks if the API key is healthy
 *     tags: [Health]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
*       200:
 *         description: API Key is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 */
router.get("/api-key", requireApiKey, healthCheckWithApiKey);

export default router;
