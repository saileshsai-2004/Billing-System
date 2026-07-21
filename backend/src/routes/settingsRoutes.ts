import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settingsController";
import { requireAdminAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getSettings);
router.post("/", requireAdminAuth as any, updateSettings);

export default router;
