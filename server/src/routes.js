"use strict";

const { Router } = require("express");
const authRoutes = require("./modules/auth/routes");
const adminRoutes = require("./modules/admin/routes");
const apiKeysRoutes = require("./modules/api-keys/routes");

const router = Router();

router.get("/healthz", (req, res) => {
  res.json({ ok: true });
});

router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/api-keys", apiKeysRoutes);

module.exports = router;
