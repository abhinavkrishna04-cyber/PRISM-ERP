import { pool } from "../db.js";

// Tracks view, edit, delete, export, login actions
export const logActivity = async (userId, action, module, ipAddress, companyId) => {
    try {
        await pool.query(
            "INSERT INTO activity_logs (user_id, action, module, ip_address, company_id) VALUES ($1, $2, $3, $4, $5)",
            [userId, action, module, ipAddress, companyId]
        );
    } catch (error) {
        console.error("DLP Logger Error:", error);
    }
};

export const dlpMiddleware = (moduleName, actionName) => {
    return async (req, res, next) => {
        // Run next() immediately so the request isn't blocked by logging
        next();
        
        try {
            const userId = req.user ? req.user.id : null;
            const companyId = req.user ? req.user.company_id : null;
            const ip = req.ip || req.connection.remoteAddress;
            // Record to the database async
            if (userId) {
                await logActivity(userId, actionName, moduleName, ip, companyId);
            }
        } catch (error) {
            console.error("Failed to log DLP activity", error);
        }
    };
};
