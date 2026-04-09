import { pool } from "../db.js";

export const getLogs = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT a.*, u.name as user_name 
            FROM activity_logs a 
            LEFT JOIN users u ON a.user_id = u.id 
            WHERE a.company_id = $1
            ORDER BY a.timestamp DESC 
            LIMIT 100
        `, [req.user.company_id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
