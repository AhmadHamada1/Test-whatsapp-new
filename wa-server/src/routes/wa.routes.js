"use strict";

const { Router } = require("express");
const { validate } = require("../middleware/validate");
const { requireApiKey } = require("../middleware/requireApiKey");
const { createApiLogger } = require("../middleware/apiLogger");
const { addNumberHandler, listConnectionsHandler, sendHandler, disconnectHandler, getConnectionStatusHandler } = require("../controllers/wa.controller");
const { sendSchema } = require("../validators/wa.validators");

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
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Success"
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: "#/components/schemas/QRCode"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       401:
 *         description: Unauthorized - Invalid API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *             examples:
 *               connected:
 *                 summary: Already connected
 *                 value:
 *                   connectionId: "507f1f77bcf86cd799439011"
 *                   alreadyConnected: true
 *                   accountInfo:
 *                     phoneNumber: "1234567890"
 *                     whatsappId: "1234567890@c.us"
 *                     profileName: "John Doe"
 *                     platform: "android"
 *               qr_code:
 *                 summary: QR code for pairing
 *                 value:
 *                   connectionId: "507f1f77bcf86cd799439012"
 *                   qr: "2@ABC123DEF456..."
 *                   qrImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
 */
router.post("/add-number", requireApiKey, addNumberHandler);

/**
 * @openapi
 * /wa/disconnect/{connectionId}:
 *   post:
 *     summary: Disconnect specific WhatsApp connection
 *     description: Disconnect a specific WhatsApp connection by ID
 *     tags: [WhatsApp]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Connection ID to disconnect
 *     responses:
 *       200:
 *         description: WhatsApp connection disconnected successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Success"
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         success:
 *                           type: boolean
 *                         message:
 *                           type: string
 *                         connectionId:
 *                           type: string
 *                         disconnectedAt:
 *                           type: string
 *                           format: date-time
 *       401:
 *         description: Unauthorized - Invalid API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       404:
 *         description: No active connection found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.post("/disconnect/:connectionId", requireApiKey, disconnectHandler);

/**
 * @openapi
 * /wa/status:
 *   get:
 *     summary: Get WhatsApp connection status
 *     description: Check the status of the most recent WhatsApp connection for the API key
 *     tags: [WhatsApp]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Connection status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Success"
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: "#/components/schemas/Connection"
 *       401:
 *         description: Unauthorized - Invalid API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *             examples:
 *               not_started:
 *                 summary: No connection attempt
 *                 value:
 *                   ok: true
 *                   data:
 *                     status: "not_started"
 *                     connectionStep: "not_started"
 *                     isReady: false
 *                     message: "No connection attempt found. Call /wa/add-number first."
 *               qr_generated:
 *                 summary: QR code generated
 *                 value:
 *                   ok: true
 *                   data:
 *                     status: "pending"
 *                     connectionStep: "qr_generated"
 *                     isReady: false
 *                     message: "QR code generated. Please scan it with your WhatsApp mobile app."
 *                     lastQrAt: "2024-01-15T10:30:00.000Z"
 *               ready:
 *                 summary: Connected and ready
 *                 value:
 *                   ok: true
 *                   data:
 *                     status: "ready"
 *                     connectionStep: "ready"
 *                     isReady: true
 *                     message: "WhatsApp is connected and ready to send messages!"
 *                     readyAt: "2024-01-15T10:35:00.000Z"
 */
router.get("/status", requireApiKey, getConnectionStatusHandler);

/**
 * @openapi
 * /wa/status/{connectionId}:
 *   get:
 *     summary: Get specific WhatsApp connection status
 *     description: Check the status of a specific WhatsApp connection by ID
 *     tags: [WhatsApp]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Connection ID to check status for
 *     responses:
 *       200:
 *         description: Connection status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Success"
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: "#/components/schemas/Connection"
 *       401:
 *         description: Unauthorized - Invalid API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       404:
 *         description: Connection not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.get("/status/:connectionId", requireApiKey, getConnectionStatusHandler);

/**
 * @openapi
 * /wa/connections:
 *   get:
 *     summary: List all WhatsApp connections for the API key
 *     description: Retrieve a list of all WhatsApp connections associated with the API key
 *     tags: [WhatsApp]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: List of connections retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Success"
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: "#/components/schemas/Connection"
 *             examples:
 *               multiple_connections:
 *                 summary: Multiple connections
 *                 value:
 *                   ok: true
 *                   data:
 *                     - id: "507f1f77bcf86cd799439011"
 *                       status: "ready"
 *                       connectionStep: "ready"
 *                       isReady: true
 *                       message: "WhatsApp is connected and ready"
 *                       readyAt: "2024-01-15T10:35:00.000Z"
 *                       createdAt: "2024-01-15T10:30:00.000Z"
 *                       accountInfo:
 *                         phoneNumber: "1234567890"
 *                         whatsappId: "1234567890@c.us"
 *                         profileName: "John Doe"
 *                         platform: "android"
 *                     - id: "507f1f77bcf86cd799439012"
 *                       status: "pending"
 *                       connectionStep: "qr_generated"
 *                       isReady: false
 *                       message: "QR code generated. Please scan it."
 *                       lastQrAt: "2024-01-15T10:30:00.000Z"
 *                       createdAt: "2024-01-15T10:29:00.000Z"
 *               no_connections:
 *                 summary: No connections
 *                 value:
 *                   ok: true
 *                   data: []
 *       401:
 *         description: Unauthorized - Invalid API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.get("/connections", requireApiKey, listConnectionsHandler);

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
 *             $ref: "#/components/schemas/Message"
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: "#/components/schemas/Success"
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: "#/components/schemas/MessageResponse"
 *       400:
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       401:
 *         description: Unauthorized - Invalid API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       404:
 *         description: Connection not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/Error"
 */
router.post("/send", requireApiKey, validate(sendSchema), sendHandler);

module.exports = router;


