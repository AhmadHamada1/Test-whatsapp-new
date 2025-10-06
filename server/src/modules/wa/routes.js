"use strict";

const { Router } = require("express");
const { validate } = require("../../core/middleware/validate");
const { requireApiKey } = require("../../core/middleware/requireApiKey");
const { requireAdminJwt } = require("../../core/middleware/requireAdminJwt");
const { createApiLogger } = require("../../core/middleware/apiLogger");
const { addNumberHandler, listConnectionsHandler, sendHandler, listConnectionsAdminHandler, disconnectHandler } = require("./controller");
const { sendSchema } = require("./validators");

const router = Router();

// Apply API logging middleware to all routes
router.use(createApiLogger());

/**
 * @openapi
 * /wa/add-number:
 *   post:
 *     summary: Start WhatsApp client and retrieve QR code for pairing
 *     tags: [WhatsApp]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: QR code for pairing (or already connected)
 */
router.post("/add-number", requireApiKey, addNumberHandler);

/**
 * @openapi
 * /wa/disconnect:
 *   post:
 *     summary: Disconnect WhatsApp number
 *     description: Disconnect the current WhatsApp connection for the API key
 *     tags: [WhatsApp]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: WhatsApp connection disconnected successfully
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
 *                     success:
 *                       type: boolean
 *                     message:
 *                       type: string
 *                     disconnectedAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: No active connection found
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
 *                   example: "No active connection found for this API key"
 *       500:
 *         description: Internal server error
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
 *                   example: "Failed to disconnect WhatsApp"
 */
router.post("/disconnect", requireApiKey, disconnectHandler);

/**
 * @openapi
 * /wa/connections:
 *   get:
 *     summary: List all WhatsApp connections for the API key
 *     tags: [WhatsApp]
 *     security:
 *       - apiKeyAuth: []
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
 */
router.get("/connections", requireApiKey, listConnectionsHandler);

/**
 * @openapi
 * /wa/admin/connections/{apiKeyId}:
 *   get:
 *     summary: List all WhatsApp connections for a specific API key (Admin)
 *     tags: [WhatsApp]
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
 */
router.get("/admin/connections/:apiKeyId", requireAdminJwt, listConnectionsAdminHandler);

/**
 * @openapi
 * /wa/send:
 *   post:
 *     summary: Send a message (text or media)
 *     tags: [WhatsApp]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 description: Recipient phone number
 *               text:
 *                 type: string
 *                 description: Text message content
 *               media:
 *                 type: object
 *                 properties:
 *                   mimetype:
 *                     type: string
 *                   filename:
 *                     type: string
 *                   dataBase64:
 *                     type: string
 *                 description: Media message content
 *               connectionCode:
 *                 type: string
 *                 description: Optional connection ID to use for sending (if not provided, uses default connection)
 *             required: [to]
 *     responses:
 *       200:
 *         description: Message sent
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
 *                     id:
 *                       type: string
 *                     timestamp:
 *                       type: number
 */
router.post("/send", requireApiKey, validate(sendSchema), sendHandler);

module.exports = router;


