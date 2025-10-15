import { Router } from "express";
import {
  addConnection,
  sendMessage,
  getConnectionStatus,
  updateConnectionStatus,
  disconnectConnection
} from "./controller";
import { requireApiKey } from "../../middlewares/requireApiKey";

const router = Router();

/**
 * @swagger
 * /v1/wa/connections/add:
 *   post:
 *     summary: Create a new WhatsApp connection
 *     description: Initiates a new WhatsApp Web connection and returns a QR code for authentication
 *     tags: [Connections]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Optional name for the connection
 *                 example: "My WhatsApp Bot"
 *     responses:
 *       200:
 *         description: Connection created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Connection'
 *       400:
 *         description: Bad request - Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/connections/add', requireApiKey, addConnection);

/**
 * @swagger
 * /v1/wa/connections/{connectionId}/status:
 *   get:
 *     summary: Get connection status
 *     description: Retrieves the current status of a WhatsApp connection
 *     tags: [Connections]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier for the connection
 *         example: "conn_123456789"
 *     responses:
 *       200:
 *         description: Connection status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Connection'
 *       400:
 *         description: Bad request - Invalid connection ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Connection not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/connections/:connectionId/status', requireApiKey, getConnectionStatus);

/**
 * @swagger
 * /v1/wa/connections/{connectionId}/status:
 *   put:
 *     summary: Update connection status
 *     description: Updates the status of a WhatsApp connection
 *     tags: [Connections]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier for the connection
 *         example: "conn_123456789"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [connecting, connected, disconnected, error]
 *                 description: New status for the connection
 *                 example: "connected"
 *     responses:
 *       200:
 *         description: Connection status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Connection'
 *       400:
 *         description: Bad request - Invalid status or connection ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Connection not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/connections/:connectionId/status', requireApiKey, updateConnectionStatus);

/**
 * @swagger
 * /v1/wa/connections/{connectionId}/disconnect:
 *   post:
 *     summary: Disconnect a WhatsApp connection
 *     description: Disconnects and removes a WhatsApp connection
 *     tags: [Connections]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: connectionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier for the connection
 *         example: "conn_123456789"
 *     responses:
 *       200:
 *         description: Connection disconnected successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         connectionId:
 *                           type: string
 *                           example: "conn_123456789"
 *                         status:
 *                           type: string
 *                           example: "disconnected"
 *       400:
 *         description: Bad request - Invalid connection ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Connection not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/connections/:connectionId/disconnect', requireApiKey, disconnectConnection);

/**
 * @swagger
 * /v1/wa/messages/send:
 *   post:
 *     summary: Send a WhatsApp message
 *     description: Sends a message through a WhatsApp connection
 *     tags: [Messages]
 *     security:
 *       - apiKeyAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - connectionId
 *               - to
 *               - content
 *             properties:
 *               connectionId:
 *                 type: string
 *                 description: ID of the connection to use for sending
 *                 example: "conn_123456789"
 *               to:
 *                 type: string
 *                 description: Recipient phone number (with country code)
 *                 example: "+1234567890"
 *               content:
 *                 type: string
 *                 description: Message content
 *                 example: "Hello, this is a test message!"
 *               type:
 *                 type: string
 *                 enum: [text, image, document, audio, video]
 *                 description: Type of message
 *                 default: "text"
 *                 example: "text"
 *               mediaUrl:
 *                 type: string
 *                 description: URL of media file (for non-text messages)
 *                 example: "https://example.com/image.jpg"
 *     responses:
 *       200:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Message'
 *       400:
 *         description: Bad request - Invalid input or connection not ready
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - Invalid API key
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Connection not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/messages/send', requireApiKey, sendMessage);

export default router;
