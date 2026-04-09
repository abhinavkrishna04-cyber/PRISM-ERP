import express from "express";
import { getRoles, getRolePermissions, updateRolePermissions, createRole } from "../controllers/roleController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
    .get(protect, adminOnly, getRoles)
    .post(protect, adminOnly, createRole);

router.route("/:roleName")
    .get(protect, adminOnly, getRolePermissions)
    .put(protect, adminOnly, updateRolePermissions);

export default router;
