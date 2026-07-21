import { Router } from "express";
import { getBills, createBill, getBillPdf, resendBillEmail, previewBill } from "../controllers/billsController";
import { requireAdminAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/", requireAdminAuth as any, getBills);
router.post("/", requireAdminAuth as any, createBill);
router.post("/preview", previewBill);
router.get("/:id/pdf", requireAdminAuth as any, getBillPdf);
router.post("/:id/resend", requireAdminAuth as any, resendBillEmail);

export default router;
