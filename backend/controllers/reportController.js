import { pool } from "../db.js";

export const getDashboardStats = async (req, res) => {
    try {
        const companyId = req.user.company_id;

        // Total Revenue
        const revenueResult = await pool.query(
            "SELECT SUM(amount) as total FROM finance WHERE company_id = $1 AND type = 'Income'",
            [companyId]
        );

        // Inventory Count
        const inventoryResult = await pool.query(
            "SELECT COUNT(*) as count FROM inventory WHERE company_id = $1",
            [companyId]
        );

        // Active Employees
        const employeeResult = await pool.query(
            "SELECT COUNT(*) as count FROM users WHERE company_id = $1 AND status = 'active'",
            [companyId]
        );

        // Security Alerts (Recent high-risk logs - mocked count for now)
        const alertsResult = await pool.query(
            "SELECT COUNT(*) as count FROM activity_logs WHERE company_id = $1 AND action LIKE '%DELETE%'",
            [companyId]
        );

        res.json({
            revenue: revenueResult.rows[0].total || 0,
            inventoryCount: inventoryResult.rows[0].count || 0,
            employeeCount: employeeResult.rows[0].count || 0,
            securityAlerts: alertsResult.rows[0].count || 0
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getFinancialBreakdown = async (req, res) => {
    try {
        const companyId = req.user.company_id;
        
        // Monthly breakdown for last 6 months
        const monthlyQuery = await pool.query(
            "SELECT TO_CHAR(date, 'Mon') as month, \
             SUM(CASE WHEN type = 'Income' THEN amount ELSE 0 END) as income, \
             SUM(CASE WHEN type = 'Expense' THEN amount ELSE 0 END) as expense \
             FROM finance \
             WHERE company_id = $1 \
             GROUP BY month, TO_CHAR(date, 'MM') \
             ORDER BY TO_CHAR(date, 'MM') DESC \
             LIMIT 6",
            [companyId]
        );

        // Category breakdown
        const categoryQuery = await pool.query(
            "SELECT category, SUM(amount) as total \
             FROM finance \
             WHERE company_id = $1 \
             GROUP BY category \
             ORDER BY total DESC",
            [companyId]
        );

        res.json({
            monthly: monthlyQuery.rows.reverse(),
            categories: categoryQuery.rows
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
