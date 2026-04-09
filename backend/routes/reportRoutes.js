import express from "express";
import { getDashboardStats, getFinancialBreakdown } from "../controllers/reportController.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/dashboard", protect, getDashboardStats);
router.get("/financials", protect, checkPermission("Reports", "VIEW"), getFinancialBreakdown);

export default router;
