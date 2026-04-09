import { pool } from "../db.js";

export const getEmployees = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.*, u.name, u.email, u.role
            FROM employees e
            JOIN users u ON e.user_id = u.id
            WHERE e.company_id = $1
            ORDER BY e.join_date DESC
        `, [req.user.company_id]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


export const addEmployee = async (req, res) => {
    const { userId, department, position, join_date } = req.body;
    try {
        // Verify user belongs to same company
        const userCheck = await pool.query("SELECT * FROM users WHERE id = $1 AND company_id = $2", [userId, req.user.company_id]);
        if (userCheck.rows.length === 0) {
            return res.status(404).json({ message: "User not found in your organization" });
        }

        const result = await pool.query(
            "INSERT INTO employees (user_id, company_id, department, position, join_date) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [userId, req.user.company_id, department, position, join_date]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const { department, position, join_date } = req.body;
    try {
        const result = await pool.query(
            "UPDATE employees SET department = $1, position = $2, join_date = $3 \
             WHERE id = $4 AND company_id = $5 RETURNING *",
            [department, position, join_date, id, req.user.company_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Employee record not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "DELETE FROM employees WHERE id = $1 AND company_id = $2 RETURNING *",
            [id, req.user.company_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Employee record not found" });
        }
        res.json({ message: "Employee record deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
