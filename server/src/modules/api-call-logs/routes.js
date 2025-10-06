"use strict";

const { Router } = require("express");
const { requireAdminJwt } = require("../../core/middleware/requireAdminJwt");
const { getLogsHandler, getStatsHandler } = require("./controller");

const router = Router();

/**
 * @openapi
 * /api-call-logs/{apiKeyId}:
 *   get:
 *     summary: Get API call logs for a specific API key
 *     tags: [API Call Logs]
 *     parameters:
 *       - in: path
 *         name: apiKeyId
 *         required: true
 *         schema:
 *           type: string
 *         description: API key ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Number of logs to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *         description: Number of logs to skip
 *       - in: query
 *         name: endpoint
 *         schema:
 *           type: string
 *         description: Filter by endpoint
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [GET, POST, PUT, DELETE, PATCH]
 *         description: Filter by HTTP method
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: Filter by response status code
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter logs until this date
 *     responses:
 *       200:
 *         description: API call logs retrieved successfully
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
 *                     logs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           endpoint:
 *                             type: string
 *                           method:
 *                             type: string
 *                           responseStatus:
 *                             type: integer
 *                           responseTime:
 *                             type: number
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     total:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 */
router.get("/:apiKeyId", requireAdminJwt, getLogsHandler);

/**
 * @openapi
 * /api-call-logs/{apiKeyId}/stats:
 *   get:
 *     summary: Get API call statistics for a specific API key
 *     tags: [API Call Logs]
 *     parameters:
 *       - in: path
 *         name: apiKeyId
 *         required: true
 *         schema:
 *           type: string
 *         description: API key ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter stats from this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter stats until this date
 *     responses:
 *       200:
 *         description: API call statistics retrieved successfully
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
 *                     totalCalls:
 *                       type: integer
 *                     successCalls:
 *                       type: integer
 *                     errorCalls:
 *                       type: integer
 *                     avgResponseTime:
 *                       type: number
 *                     endpoints:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           endpoint:
 *                             type: string
 *                           method:
 *                             type: string
 *                           status:
 *                             type: integer
 */
router.get("/:apiKeyId/stats", requireAdminJwt, getStatsHandler);

module.exports = router;
