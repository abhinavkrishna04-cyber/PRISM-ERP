import { pool } from "./db.js";

async function migrate() {
    try {
        console.log("Starting Database Migration...");

        // 1. Create Companies table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS companies (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Companies table ensured.");

        // 2. Add columns to Users table
        // We use ALTER TABLE and catch errors if columns exist
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS company_id INTEGER REFERENCES companies(id),
            ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
            ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255),
            ADD COLUMN IF NOT EXISTS reset_token_expiry TIMESTAMP;
        `);
        console.log("Users table columns ensured.");

        // 3. Ensure a default company exists for seeded data
        const defaultCompany = await pool.query("INSERT INTO companies (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id", ["Prism Global Corp"]);
        const companyId = defaultCompany.rows[0].id;

        // 4. Update existing users to the default company if they don't have one
        await pool.query("UPDATE users SET company_id = $1 WHERE company_id IS NULL", [companyId]);
        console.log("Existing users linked to default company.");

        console.log("Migration completed successfully!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        pool.end();
    }
}

migrate();
