"use strict";

const { Router } = require("express");
const healthRoutes = require("./modules/health/router");
const waRoutes = require("./modules/wa/router");

const router = Router();

router.use("/health", healthRoutes);
router.use("/v1/wa/", waRoutes);

module.exports = router;