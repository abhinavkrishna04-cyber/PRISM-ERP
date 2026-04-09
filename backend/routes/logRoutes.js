import express from "express";
import { getLogs } from "../controllers/logController.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import { dlpMiddleware } from "../middleware/dlpLogger.js";

const router = express.Router();

// Only admin can view security logs, but we just protect it generally and use dlpMiddleware
router.route("/").get(protect, checkPermission("Security Logs", "VIEW"), dlpMiddleware("Security Logs", "VIEW_LOGS"), getLogs);

export default router;
