"use strict";

const { Router } = require("express");
const waRoutes = require("./modules/wa/routes");

const router = Router();

// Health check endpoint
router.get("/healthz", (req, res) => {
  res.json({ ok: true, service: "wa-server" });
});

// WhatsApp API Routes
router.use("/wa", waRoutes);

module.exports = router;