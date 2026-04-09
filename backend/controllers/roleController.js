import { pool } from "../db.js";

export const getRoles = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT DISTINCT role FROM role_modules WHERE company_id = $1",
            [req.user.company_id]
        );
        res.json(result.rows.map(r => r.role));
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getRolePermissions = async (req, res) => {
    const { roleName } = req.params;
    try {
        const result = await pool.query(
            "SELECT m.name as module, m.id as module_id, rm.can_view, rm.can_add, rm.can_edit, rm.can_delete, rm.can_copy \
             FROM role_modules rm \
             JOIN modules m ON rm.module_id = m.id \
             WHERE rm.company_id = $1 AND rm.role = $2",
            [req.user.company_id, roleName]
        );
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateRolePermissions = async (req, res) => {
    const { roleName } = req.params;
    const { module_id, can_view, can_add, can_edit, can_delete, can_copy } = req.body;
    try {
        const result = await pool.query(
            "UPDATE role_modules SET can_view = $1, can_add = $2, can_edit = $3, can_delete = $4, can_copy = $5 \
             WHERE company_id = $6 AND role = $7 AND module_id = $8 RETURNING *",
            [can_view, can_add, can_edit, can_delete, can_copy, req.user.company_id, roleName, module_id]
        );
        
        if (result.rows.length === 0) {
            // If doesn't exist, create it
            const newPerm = await pool.query(
                "INSERT INTO role_modules (company_id, role, module_id, can_view, can_add, can_edit, can_delete, can_copy) \
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
                [req.user.company_id, roleName, module_id, can_view, can_add, can_edit, can_delete, can_copy]
            );
            return res.json(newPerm.rows[0]);
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const createRole = async (req, res) => {
    const { roleName } = req.body;
    try {
        // Initialize role with all modules set to false
        const modules = await pool.query("SELECT id FROM modules");
        for (const module of modules.rows) {
            await pool.query(
                "INSERT INTO role_modules (company_id, role, module_id, can_view, can_add, can_edit, can_delete, can_copy) \
                 VALUES ($1, $2, $3, false, false, false, false, false) ON CONFLICT DO NOTHING",
                [req.user.company_id, roleName, module.id]
            );
        }
        res.status(201).json({ message: `Role ${roleName} created successfully` });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
