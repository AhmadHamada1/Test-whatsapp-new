"use strict";

const { Router } = require("express");
const { validate } = require("../../core/middleware/validate");
const { requireAdminJwt } = require("../../core/middleware/requireAdminJwt");
const { login, me } = require("./controller");
const { loginSchema } = require("./validators");

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Admin login
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *             required: [email, password]
 *     responses:
 *       200:
 *         description: JWT token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 */
router.post("/login", validate(loginSchema), login);

/**
 * @openapi
 * /auth/me:
 *   get:
 *     summary: Get current admin
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 admin:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 */
router.get("/me", requireAdminJwt, me);

module.exports = router;


