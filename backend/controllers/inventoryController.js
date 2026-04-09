import { pool } from "../db.js";

export const getInventory = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM inventory WHERE company_id = $1 ORDER BY last_updated DESC",
            [req.user.company_id]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const addInventoryItem = async (req, res) => {
    const { sku, name, quantity, price, category } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO inventory (sku, name, quantity, price, category, company_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [sku, name, quantity, price, category, req.user.company_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateInventoryItem = async (req, res) => {
    const { id } = req.params;
    const { sku, name, quantity, price, category } = req.body;
    try {
        const result = await pool.query(
            "UPDATE inventory SET sku = $1, name = $2, quantity = $3, price = $4, category = $5, last_updated = CURRENT_TIMESTAMP \
             WHERE id = $6 AND company_id = $7 RETURNING *",
            [sku, name, quantity, price, category, id, req.user.company_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteInventoryItem = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query(
            "DELETE FROM inventory WHERE id = $1 AND company_id = $2 RETURNING *",
            [id, req.user.company_id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Item not found" });
        }
        res.json({ message: "Item deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
