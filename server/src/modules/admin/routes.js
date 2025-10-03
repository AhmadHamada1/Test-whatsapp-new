"use strict";

const { Router } = require("express");
const { validate } = require("../../core/middleware/validate");
const { requireAdminJwt } = require("../../core/middleware/requireAdminJwt");
const { changePasswordSchema } = require("./validators");
const { changePasswordHandler } = require("./controller");

const router = Router();

/**
 * @openapi
 * /admin/change-password:
 *   post:
 *     summary: Change admin password
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *             required: [currentPassword, newPassword]
 *     responses:
 *       200:
 *         description: Password changed
 */
router.post("/change-password", requireAdminJwt, validate(changePasswordSchema), changePasswordHandler);

module.exports = router;


