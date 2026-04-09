import express from "express";
import { getModules, toggleModule } from "../controllers/moduleController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(protect, getModules);

router.route("/:id/toggle")
    .put(protect, adminOnly, toggleModule);

export default router;
