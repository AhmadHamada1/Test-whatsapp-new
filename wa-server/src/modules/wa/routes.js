"use strict";

const { Router } = require("express");
const { validate } = require("../../core/middleware/validate");
const { requireApiKey } = require("../../core/middleware/requireApiKey");
const { createApiLogger } = require("../../core/middleware/apiLogger");
const { addNumberHandler, listConnectionsHandler, sendHandler, disconnectHandler, getConnectionStatusHandler } = require("./controller");
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 connectionId:
 *                   type: string
 *                   description: Unique identifier for this connection
 *                 alreadyConnected:
 *                   type: boolean
 *                   description: True if already connected
 *                 qr:
 *                   type: string
 *                   description: QR code string for WhatsApp pairing
 *                 qrImage:
 *                   type: string
 *                   description: Base64 encoded PNG image of the QR code
 *                   format: data-url
 *                 accountInfo:
 *                   type: object
 *                   description: Account information (only present if alreadyConnected is true)
 *                   properties:
 *                     phoneNumber:
 *                       type: string
 *                     whatsappId:
 *                       type: string
 *                     profileName:
 *                       type: string
 *                     platform:
 *                       type: string
 *                     profilePictureUrl:
 *                       type: string
 *                     statusMessage:
 *                       type: string
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
 *                     connectionId:
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
router.post("/disconnect/:connectionId", requireApiKey, disconnectHandler);

/**
 * @openapi
 * /wa/status/{connectionId}:
 *   get:
 *     summary: Get specific WhatsApp connection status
 *     description: Check the status of a specific WhatsApp connection
 *     tags: [WhatsApp]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: false
 *         schema:
 *           type: string
 *         description: Connection ID to check status for (optional - if not provided, returns most recent connection)
 *     responses:
 *       200:
 *         description: Connection status retrieved successfully
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
 *                     connectionId:
 *                       type: string
 *                     status:
 *                       type: string
 *                       enum: [not_started, pending, authenticated, ready, auth_failed, disconnected]
 *                     connectionStep:
 *                       type: string
 *                       enum: [not_started, qr_generated, authenticated, ready, auth_failed, disconnected]
 *                     isReady:
 *                       type: boolean
 *                     message:
 *                       type: string
 *                     lastQrAt:
 *                       type: string
 *                       format: date-time
 *                     authenticatedAt:
 *                       type: string
 *                       format: date-time
 *                     readyAt:
 *                       type: string
 *                       format: date-time
 *                     authFailedAt:
 *                       type: string
 *                       format: date-time
 *                     disconnectedAt:
 *                       type: string
 *                       format: date-time
 *                     error:
 *                       type: string
 *                     disconnectReason:
 *                       type: string
 *                     accountInfo:
 *                       type: object
 *                       properties:
 *                         phoneNumber:
 *                           type: string
 *                           description: Connected WhatsApp phone number
 *                         whatsappId:
 *                           type: string
 *                           description: Full WhatsApp ID with country code
 *                         profileName:
 *                           type: string
 *                           description: Display name set by the user
 *                         platform:
 *                           type: string
 *                           description: Device platform (Android/iOS)
 *                         profilePictureUrl:
 *                           type: string
 *                           description: URL to user's profile picture
 *                         statusMessage:
 *                           type: string
 *                           description: User's status message
 *                         lastSeen:
 *                           type: string
 *                           format: date-time
 *                           description: When the account was last active
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
router.get("/status/:connectionId", requireApiKey, getConnectionStatusHandler);

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
 *               connectionId:
 *                 type: string
 *                 description: Connection ID to use for sending the message
 *             required: [to, connectionId]
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


