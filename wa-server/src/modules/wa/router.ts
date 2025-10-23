import { Router } from "express";
import {
  addConnection,
  sendMessage,
  getConnectionStatus,
  getMessages,
  disconnectConnection,
  listConnections,
} from "./controllers";
import { requireApiKey } from "../../middlewares/requireApiKey";

const router = Router();

/**
 * @swagger
 * /v1/wa/connections:
 *   get:
 *     summary: List all connections
 *     description: Retrieves all WhatsApp connections associated with the API key
 *     tags: [Connections]
 *     security:
 *       - apiKeyAuth: []
 *     responses:
 *       200:
 *         description: Connections retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Connection'
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
router.get('/connections', requireApiKey, listConnections);

/**
 * @swagger
 * /v1/wa/connections/{id}:
 *   get:
 *     summary: Get connection status
 *     description: Retrieves the current status of a WhatsApp connection
 *     tags: [Connections]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier for the connection
 *         example: "507f1f77bcf86cd799439011"
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
router.get('/connections/:id', requireApiKey, getConnectionStatus);

/**
 * @swagger
 * /v1/wa/connections:
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
router.post('/connections', requireApiKey, addConnection);

/**
 * @swagger
 * /v1/wa/connections/{id}:
 *   delete:
 *     summary: Disconnect a WhatsApp connection
 *     description: Disconnects and removes a WhatsApp connection
 *     tags: [Connections]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique identifier for the connection
 *         example: "507f1f77bcf86cd799439011"
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
router.delete('/connections/:id', requireApiKey, disconnectConnection);

/**
 * @swagger
 * /v1/wa/connections/{id}/message:
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
router.post('/connections/:id/message', requireApiKey, sendMessage);

/**
 * @swagger
 * /v1/wa/connections/{id}/messages:
 *   get:
 *     summary: Get messages for a connection
 *     description: Retrieves messages for a specific WhatsApp connection with optional filtering and pagination
 *     tags: [Messages]
 *     security:
 *       - apiKeyAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Connection ID
 *         example: "conn_123456789"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Number of messages to return (1-100)
 *         example: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of messages to skip
 *         example: 0
 *       - in: query
 *         name: direction
 *         schema:
 *           type: string
 *           enum: [sent, received]
 *         description: Filter by message direction
 *         example: "sent"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, sent, delivered, read, failed]
 *         description: Filter by message status
 *         example: "sent"
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
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
 *                         messages:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Message'
 *                         pagination:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                               description: Total number of messages
 *                             limit:
 *                               type: integer
 *                               description: Number of messages per page
 *                             offset:
 *                               type: integer
 *                               description: Number of messages skipped
 *                             hasMore:
 *                               type: boolean
 *                               description: Whether there are more messages
 *                         stats:
 *                           type: object
 *                           properties:
 *                             total:
 *                               type: integer
 *                               description: Total message count
 *                             sent:
 *                               type: integer
 *                               description: Number of sent messages
 *                             received:
 *                               type: integer
 *                               description: Number of received messages
 *                             byStatus:
 *                               type: object
 *                               description: Message count by status
 *                             byType:
 *                               type: object
 *                               description: Message count by type
 *       400:
 *         description: Bad request - Invalid parameters
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
router.get('/connections/:id/messages', requireApiKey, getMessages);

export default router;
