import { Router } from "express";
import { login, me, logout } from "../controllers/authController";
import { requireAdminAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/login", login);
router.get("/me", requireAdminAuth as any, me as any);
router.post("/logout", logout);

export default router;
