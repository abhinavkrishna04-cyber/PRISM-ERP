import express from "express";
import { getInventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } from "../controllers/inventoryController.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import { dlpMiddleware } from "../middleware/dlpLogger.js";

const router = express.Router();

router.route("/")
    .get(protect, checkPermission("Inventory", "VIEW"), dlpMiddleware("Inventory", "VIEW_ALL"), getInventory)
    .post(protect, checkPermission("Inventory", "ADD"), dlpMiddleware("Inventory", "CREATE_ITEM"), addInventoryItem);

router.route("/:id")
    .put(protect, checkPermission("Inventory", "EDIT"), dlpMiddleware("Inventory", "UPDATE_ITEM"), updateInventoryItem)
    .delete(protect, checkPermission("Inventory", "DELETE"), dlpMiddleware("Inventory", "DELETE_ITEM"), deleteInventoryItem);

export default router;
