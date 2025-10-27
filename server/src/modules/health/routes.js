"use strict";

const { Router } = require("express");
const { requireApiKey } = require("../../core/middleware/requireApiKey");
const { createApiLogger } = require("../../core/middleware/apiLogger");
const { healthCheckHandler, systemHealthHandler } = require("./controller");

const router = Router();

// Apply API logging middleware to all routes
router.use(createApiLogger());

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Check API key health status
 *     description: Verify if the API key is working correctly and check WhatsApp connection status
 *     tags: [Health]
 *     parameters:
 *       - in: header
 *         name: x-api-key
 *         required: true
 *         schema:
 *           type: string
 *         description: API key for authentication
 *     responses:
 *       200:
 *         description: API key is healthy and ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [healthy, pending, disconnected, unhealthy, error]
 *                       description: Overall health status
 *                     message:
 *                       type: string
 *                       description: Human-readable status message
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       description: When the health check was performed
 *                     connections:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                           description: Total number of connections
 *                         ready:
 *                           type: integer
 *                           description: Number of ready connections
 *                         pending:
 *                           type: integer
 *                           description: Number of pending connections
 *                         disconnected:
 *                           type: integer
 *                           description: Number of disconnected connections
 *                     apiKey:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           description: API key ID
 *                         valid:
 *                           type: boolean
 *                           description: Whether the API key is valid
 *       202:
 *         description: API key is valid but connections are not ready
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [pending, disconnected]
 *                     message:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     connections:
 *                       type: object
 *                     apiKey:
 *                       type: object
 *       401:
 *         description: Invalid or missing API key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid or inactive API key"
 *       503:
 *         description: API key is unhealthy or system error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [unhealthy, error]
 *                     message:
 *                       type: string
 *                     error:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 */
router.get("/", requireApiKey, healthCheckHandler);

/**
 * @openapi
 * /health/system:
 *   get:
 *     summary: Check system health status
 *     description: Check overall system health without requiring API key authentication
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [healthy, unhealthy]
 *                     message:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     services:
 *                       type: object
 *                       properties:
 *                         database:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                             responseTime:
 *                               type: string
 *                         api:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                             version:
 *                               type: string
 *       503:
 *         description: System is unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: unhealthy
 *                     message:
 *                       type: string
 *                     error:
 *                       type: string
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 */
router.get("/system", systemHealthHandler);

module.exports = router;
