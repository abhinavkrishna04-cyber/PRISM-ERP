import { pool } from "../db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { logActivity } from "../middleware/dlpLogger.js";

const generateToken = (id, role, company_id) => {
    return jwt.sign({ id, role, company_id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
    });
};

export const registerUser = async (req, res) => {
    const { name, email, password, role, companyName } = req.body;

    try {
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "User already exists" });
        }

        let companyId;
        let status = "active";

        if (role === "Admin") {
            // Check if company exists
            const companyQuery = await pool.query("SELECT * FROM companies WHERE name = $1", [companyName]);
            if (companyQuery.rows.length > 0) {
                return res.status(400).json({ message: "Company name already registered. Choose another or join as Employee." });
            }
            // Create company
            const newCompany = await pool.query("INSERT INTO companies (name) VALUES ($1) RETURNING id", [companyName]);
            companyId = newCompany.rows[0].id;
        } else {
            // Join existing company
            // Find company by name or ID (we'll accept both for flexibility)
            const companyQuery = await pool.query("SELECT * FROM companies WHERE name = $1 OR id::text = $1", [companyName]);
            if (companyQuery.rows.length === 0) {
                return res.status(400).json({ message: "Company not found. Please select a valid company or contact your Admin." });
            }
            companyId = companyQuery.rows[0].id;
            status = "pending";
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const userRole = role || "Employee";

        const newUser = await pool.query(
            "INSERT INTO users (name, email, password, role, company_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, email, role, status",
            [name, email, hashedPassword, userRole, companyId, status]
        );

        if (newUser.rows.length > 0) {
            const user = newUser.rows[0];
            
            if (user.status === "pending") {
                return res.status(201).json({ 
                    message: "Registration successful. Awaiting admin approval.",
                    status: "pending" 
                });
            }

            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                token: generateToken(user.id, user.role, companyId),
            });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userQuery = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        
        if (userQuery.rows.length === 0) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const user = userQuery.rows[0];

        if (user.status === "pending") {
            return res.status(403).json({ message: "Your account is awaiting admin approval." });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            // Log successful login for DLP monitoring
            const ip = req.ip || req.connection.remoteAddress;
            await logActivity(user.id, "LOGIN", "Authentication", ip, user.company_id);

            res.json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                token: generateToken(user.id, user.role, user.company_id),
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        const userQuery = await pool.query(
            "SELECT u.id, u.name, u.email, u.role, u.status, u.company_id, c.name as company_name \
             FROM users u \
             LEFT JOIN companies c ON u.company_id = c.id \
             WHERE u.id = $1", 
            [req.user.id]
        );
        if (userQuery.rows.length > 0) {
            res.json(userQuery.rows[0]);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
         res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const userQuery = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
        if (userQuery.rows.length === 0) {
            return res.status(200).json({ message: "If that email exists, a reset link has been sent." });
        }

        const token = Math.random().toString(36).substring(2, 12).toUpperCase();
        const expiry = new Date(Date.now() + 3600000); // 1 hour

        await pool.query("UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE email = $3", [token, expiry, email]);

        // In a real app, send email. Here, we return the token for testing.
        res.json({ 
            message: "Reset link generated (Testing Mode)", 
            test_link: `http://localhost:5173/reset-password?token=${token}` 
        });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        const userQuery = await pool.query("SELECT id FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()", [token]);
        if (userQuery.rows.length === 0) {
            return res.status(400).json({ message: "Invalid or expired reset token" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await pool.query("UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE reset_token = $2", [hashedPassword, token]);
        res.json({ message: "Password reset successful" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getPendingUsers = async (req, res) => {
    try {
        // Only Admin can see pending users for their company
        const adminQuery = await pool.query("SELECT company_id FROM users WHERE id = $1", [req.user.id]);
        const companyId = adminQuery.rows[0].company_id;

        const pendingUsers = await pool.query(
            "SELECT id, name, email, role, created_at FROM users WHERE company_id = $1 AND status = 'pending'",
            [companyId]
        );
        res.json(pendingUsers.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const approveUser = async (req, res) => {
    const { id } = req.params;
    try {
        // Verify admin belongs to same company as target user
        const adminQuery = await pool.query("SELECT company_id FROM users WHERE id = $1", [req.user.id]);
        const companyId = adminQuery.rows[0].company_id;

        const userQuery = await pool.query("SELECT company_id FROM users WHERE id = $1", [id]);
        if (userQuery.rows.length === 0 || userQuery.rows[0].company_id !== companyId) {
            return res.status(403).json({ message: "Not authorized to approve this user" });
        }

        await pool.query("UPDATE users SET status = 'active' WHERE id = $1", [id]);
        res.json({ message: "User approved successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getCompanies = async (req, res) => {
    try {
        const companies = await pool.query("SELECT id, name FROM companies ORDER BY name ASC");
        res.json(companies.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

export const getPermissions = async (req, res) => {
    try {
        const { role, company_id } = req.user;
        const permissions = await pool.query(
            "SELECT m.name as module, rm.can_view, rm.can_add, rm.can_edit, rm.can_delete, rm.can_copy \
             FROM role_modules rm \
             JOIN modules m ON rm.module_id = m.id \
             WHERE rm.role = $1 AND rm.company_id = $2",
            [role, company_id]
        );
        res.json(permissions.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getCompanyUsers = async (req, res) => {
    try {
        const users = await pool.query(
            "SELECT id, name, email, role, status, created_at FROM users WHERE company_id = $1 ORDER BY name ASC",
            [req.user.company_id]
        );
        res.json(users.rows);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    try {
        // Verify target user belongs to same company
        const userCheck = await pool.query("SELECT company_id FROM users WHERE id = $1", [id]);
        if (userCheck.rows.length === 0 || userCheck.rows[0].company_id !== req.user.company_id) {
            return res.status(403).json({ message: "Not authorized to modify this user" });
        }

        await pool.query("UPDATE users SET role = $1 WHERE id = $2", [role, id]);
        res.json({ message: "User role updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
