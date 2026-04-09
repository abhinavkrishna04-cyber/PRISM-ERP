import express from "express";
import { getFinanceRecords, addFinanceRecord, updateFinanceRecord, deleteFinanceRecord } from "../controllers/financeController.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import { dlpMiddleware } from "../middleware/dlpLogger.js";

const router = express.Router();

router.route("/")
    .get(protect, checkPermission("Finance", "VIEW"), dlpMiddleware("Finance", "VIEW_ALL"), getFinanceRecords)
    .post(protect, checkPermission("Finance", "ADD"), dlpMiddleware("Finance", "CREATE_RECORD"), addFinanceRecord);

router.route("/:id")
    .put(protect, checkPermission("Finance", "EDIT"), dlpMiddleware("Finance", "UPDATE_RECORD"), updateFinanceRecord)
    .delete(protect, checkPermission("Finance", "DELETE"), dlpMiddleware("Finance", "DELETE_RECORD"), deleteFinanceRecord);

export default router;
