import express from "express";
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from "../controllers/employeeController.js";
import { protect, checkPermission } from "../middleware/authMiddleware.js";
import { dlpMiddleware } from "../middleware/dlpLogger.js";

const router = express.Router();

router.route("/")
    .get(protect, checkPermission("Employees", "VIEW"), dlpMiddleware("Employees", "VIEW_ALL"), getEmployees)
    .post(protect, checkPermission("Employees", "ADD"), dlpMiddleware("Employees", "CREATE_RECORD"), addEmployee);

router.route("/:id")
    .put(protect, checkPermission("Employees", "EDIT"), dlpMiddleware("Employees", "UPDATE_RECORD"), updateEmployee)
    .delete(protect, checkPermission("Employees", "DELETE"), dlpMiddleware("Employees", "DELETE_RECORD"), deleteEmployee);

export default router;
