import { pool } from "../db.js";

export const getFinanceRecords = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM finance WHERE company_id = $1 ORDER BY date DESC",
            [req.user.company_id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const addFinanceRecord = async (req, res) => {
    const { type, amount, category, description, date } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO finance (type, amount, category, description, date, company_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [type, amount, category, description, date, req.user.company_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateFinanceRecord = async (req, res) => {
    const { id } = req.params;
    const { type, amount, category, description, date } = req.body;
    try {
        const result = await pool.query(
            "UPDATE finance SET type = $1, amount = $2, category = $3, description = $4, date = $5 \
             WHERE id = $6 AND company_id = $7 RETURNING *",
            [type, amount, category, description, date, id, req.user.company_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Record not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteFinanceRecord = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "DELETE FROM finance WHERE id = $1 AND company_id = $2 RETURNING *",
            [id, req.user.company_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Record not found" });
        }
        res.json({ message: "Record deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
