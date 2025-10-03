"use strict";

const { Router } = require("express");
const { requireAdminJwt } = require("../../core/middleware/requireAdminJwt");
const { validate } = require("../../core/middleware/validate");
const { createSchema } = require("./validators");
const controller = require("./controller");

const router = Router();

/**
 * @openapi
 * /api-keys:
 *   get:
 *     summary: List API keys
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Keys
 */
router.get("/", requireAdminJwt, controller.list);

/**
 * @openapi
 * /api-keys:
 *   post:
 *     summary: Create API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               label:
 *                 type: string
 *     responses:
 *       201:
 *         description: Created, returns raw token once
 */
router.post("/", requireAdminJwt, validate(createSchema), controller.create);

/**
 * @openapi
 * /api-keys/{id}:
 *   get:
 *     summary: Get API key details
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Key details
 */
router.get("/:id", requireAdminJwt, controller.details);

/**
 * @openapi
 * /api-keys/{id}/revoke:
 *   post:
 *     summary: Revoke API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Key revoked
 */
router.post("/:id/revoke", requireAdminJwt, controller.revoke);

/**
 * @openapi
 * /api-keys/{id}/activate:
 *   post:
 *     summary: Activate API key
 *     tags: [API Keys]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Key activated
 */
router.post("/:id/activate", requireAdminJwt, controller.activate);

module.exports = router;


