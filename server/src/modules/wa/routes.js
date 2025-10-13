"use strict";

const { Router } = require("express");
const { requireAdminJwt } = require("../../core/middleware/requireAdminJwt");
const { createApiLogger } = require("../../core/middleware/apiLogger");
const { listConnectionsAdminHandler } = require("./controller");

const router = Router();

// Apply API logging middleware to all routes
router.use(createApiLogger());

/**
 * @openapi
 * /wa/monitor/connections/{apiKeyId}:
 *   get:
 *     summary: List all WhatsApp connections for a specific API key (Admin)
 *     tags: [WhatsApp]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: apiKeyId
 *         required: true
 *         schema:
 *           type: string
 *         description: API key ID
 *     responses:
 *       200:
 *         description: List of connections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [pending, ready, disconnected]
 *                       lastQrAt:
 *                         type: string
 *                         format: date-time
 *                       readyAt:
 *                         type: string
 *                         format: date-time
 *                       disconnectedAt:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       accountInfo:
 *                         type: object
 *                         properties:
 *                           phoneNumber:
 *                             type: string
 *                           whatsappId:
 *                             type: string
 *                           profileName:
 *                             type: string
 *                           platform:
 *                             type: string
 *                           profilePictureUrl:
 *                             type: string
 *                           statusMessage:
 *                             type: string
 *                           lastSeen:
 *                             type: string
 *                             format: date-time
 */
router.get("/monitor/connections/:apiKeyId", requireAdminJwt, listConnectionsAdminHandler);

module.exports = router;