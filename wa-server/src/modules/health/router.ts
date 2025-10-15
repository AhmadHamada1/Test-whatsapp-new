import { Router, Request, Response } from "express";

const router = Router();

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
router.get("/", (req: Request, res: Response) => {
  res.json({ message: "it is working" });
});

export default router;
