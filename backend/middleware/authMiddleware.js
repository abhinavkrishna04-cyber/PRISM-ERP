import jwt from "jsonwebtoken";
import { pool } from "../db.js";

export const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = decoded; // { id, role }
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        res.status(401).json({ message: "Not authorized, no token" });
    }
};

export const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "Admin") {
        next();
    } else {
        res.status(403).json({ message: "Not authorized as an admin" });
    }
};

export const checkPermission = (moduleName, action) => {
    return async (req, res, next) => {
        try {
            if (req.user.role === "Admin") return next();

            const permissionKey = `can_${action.toLowerCase()}`;
            const result = await pool.query(
                "SELECT rm.* FROM role_modules rm \
                 JOIN modules m ON rm.module_id = m.id \
                 WHERE rm.company_id = $1 AND rm.role = $2 AND m.name = $3",
                [req.user.company_id, req.user.role, moduleName]
            );

            if (result.rows.length > 0 && result.rows[0][permissionKey]) {
                return next();
            }

            res.status(403).json({ message: `Access denied: No ${action} permission for ${moduleName}` });
        } catch (error) {
            res.status(500).json({ message: "Permission check error" });
        }
    };
};
