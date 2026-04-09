import { pool } from "../db.js";

export const getModules = async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM modules ORDER BY name ASC");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const toggleModule = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    try {
        const result = await pool.query(
            "UPDATE modules SET is_active = $1 WHERE id = $2 RETURNING *",
            [is_active, id]
        );
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
