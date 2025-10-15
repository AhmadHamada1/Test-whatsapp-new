import { Router } from "express";
import healthRoutes from "./modules/health/router";
import waRoutes from "./modules/wa/router";

const router = Router();

router.use("/health", healthRoutes);
router.use("/v1/wa/", waRoutes);

export default router;
