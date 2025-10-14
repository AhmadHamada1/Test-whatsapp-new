"use strict";

const express = require("express");

const router = express.Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     description: Returns a simple working status
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is working
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "it is working"
 */
router.get("/", (req, res) => {
  res.json({ message: "it is working" });
});

module.exports = router;