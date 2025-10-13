"use strict";

const { Router } = require("express");
const authRoutes = require("./modules/auth/routes");
const adminRoutes = require("./modules/admin/routes");
const apiKeysRoutes = require("./modules/api-keys/routes");
const apiCallLogsRoutes = require("./modules/api-call-logs/routes");
const healthRoutes = require("./modules/health/routes");

const router = Router();

router.get("/healthz", (req, res) => {
  res.json({ ok: true });
});

// Core system routes
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/api-keys", apiKeysRoutes);
router.use("/api-call-logs", apiCallLogsRoutes);
router.use("/health", healthRoutes);

// Note: WhatsApp routes have been moved to wa-server

module.exports = router;
