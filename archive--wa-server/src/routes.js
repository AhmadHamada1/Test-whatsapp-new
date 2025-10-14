"use strict";

const { Router } = require("express");
const waRoutes = require("./routes/wa.routes");

const router = Router();

/**
 * @openapi
 * /healthz:
 *   get:
 *     summary: Health check endpoint
 *     description: Check if the WhatsApp server is running and healthy
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 service:
 *                   type: string
 *                   example: "wa-server"
 */
router.get("/healthz", (req, res) => {
  res.json({ ok: true, service: "wa-server" });
});

// WhatsApp API Routes
router.use("/wa", waRoutes);

module.exports = router;