import express from "express";
import { 
    registerUser, 
    loginUser, 
    getProfile, 
    forgotPassword, 
    resetPassword, 
    getPendingUsers, 
    approveUser,
    getCompanies,
    getPermissions,
    getCompanyUsers,
    updateUserRole
} from "../controllers/authController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/companies", getCompanies);
router.get("/permissions", protect, getPermissions);
router.get("/users", protect, adminOnly, getCompanyUsers);
router.put("/users/:id/role", protect, adminOnly, updateUserRole);
router.get("/profile", protect, getProfile);

// Password Management
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// Admin Approvals
router.get("/pending-users", protect, adminOnly, getPendingUsers);
router.put("/approve-user/:id", protect, adminOnly, approveUser);

export default router;
