"use strict";

const { Router } = require("express");
const { validate } = require("../../core/middleware/validate");
const { requireApiKey } = require("../../core/middleware/requireApiKey");
const { addNumberHandler, sendTextHandler, sendMediaHandler, sendHandler } = require("./controller");
const { sendTextSchema, sendMediaSchema, sendSchema } = require("./validators");

const router = Router();

/**
 * @openapi
 * /wa/add-number:
 *   post:
 *     summary: Start WhatsApp client and retrieve QR code for pairing
 *     tags: [WhatsApp]
 *     responses:
 *       200:
 *         description: QR code for pairing (or already connected)
 */
router.post("/add-number", requireApiKey, addNumberHandler);

/**
 * @openapi
 * /wa/send-text:
 *   post:
 *     summary: Send a text message
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *               text:
 *                 type: string
 *             required: [to, text]
 *     responses:
 *       200:
 *         description: Message sent
 */
router.post("/send-text", requireApiKey, validate(sendTextSchema), sendTextHandler);

/**
 * @openapi
 * /wa/send-media:
 *   post:
 *     summary: Send a media message (image or file)
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *               media:
 *                 type: object
 *                 properties:
 *                   mimetype:
 *                     type: string
 *                   filename:
 *                     type: string
 *                   dataBase64:
 *                     type: string
 *                 required: [mimetype, filename, dataBase64]
 *             required: [to, media]
 *     responses:
 *       200:
 *         description: Media sent
 */
router.post("/send-media", requireApiKey, validate(sendMediaSchema), sendMediaHandler);

/**
 * @openapi
 * /wa/send:
 *   post:
 *     summary: Send a message (text or media)
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *               text:
 *                 type: string
 *               media:
 *                 type: object
 *                 properties:
 *                   mimetype:
 *                     type: string
 *                   filename:
 *                     type: string
 *                   dataBase64:
 *                     type: string
 *             required: [to]
 *     responses:
 *       200:
 *         description: Message sent
 */
router.post("/send", requireApiKey, validate(sendSchema), sendHandler);

module.exports = router;


