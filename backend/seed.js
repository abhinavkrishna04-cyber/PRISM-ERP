import { pool } from "./db.js";
import bcrypt from "bcrypt";

const seedData = async (pool) => {
    try {
        console.log("🚀 Seeding P.R.I.S.M. ERP Demo Data...\n");

        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash("password123", salt);

        // ============================================================
        // COMPANY 1: Horizon Systems (Tech / SaaS)
        // ============================================================
        console.log("→ Creating Horizon Systems...");
        const c1 = await pool.query(
            "INSERT INTO companies (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
            ["Horizon Systems"]
        );
        const cid1 = c1.rows[0].id;

        // Users
        const h_admin = await pool.query(
            "INSERT INTO users (name, email, password, role, company_id, status) VALUES ($1,$2,$3,'Admin',$4,'active') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id",
            ["Alex Carter", "alex@horizon.com", hash, cid1]
        );
        const h_mgr = await pool.query(
            "INSERT INTO users (name, email, password, role, company_id, status) VALUES ($1,$2,$3,'Manager',$4,'active') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id",
            ["Jamie Wells", "jamie@horizon.com", hash, cid1]
        );
        const h_emp = await pool.query(
            "INSERT INTO users (name, email, password, role, company_id, status) VALUES ($1,$2,$3,'Employee',$4,'active') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id",
            ["Taylor Brooks", "taylor@horizon.com", hash, cid1]
        );
        const h_aid = h_admin.rows[0].id, h_mid = h_mgr.rows[0].id, h_eid = h_emp.rows[0].id;

        // Employees table (link users to company staff directory)
        await pool.query("INSERT INTO employees (company_id, user_id, department, position, join_date) VALUES ($1,$2,'Executive','Chief Technology Officer','2022-01-15') ON CONFLICT DO NOTHING", [cid1, h_aid]);
        await pool.query("INSERT INTO employees (company_id, user_id, department, position, join_date) VALUES ($1,$2,'Engineering','Engineering Manager','2022-03-10') ON CONFLICT DO NOTHING", [cid1, h_mid]);
        await pool.query("INSERT INTO employees (company_id, user_id, department, position, join_date) VALUES ($1,$2,'Engineering','Senior Developer','2023-06-01') ON CONFLICT DO NOTHING", [cid1, h_eid]);

        // Extra users in the company
        await pool.query("INSERT INTO users (name, email, password, role, company_id, status) VALUES ($1,$2,$3,'Employee',$4,'active') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id", ["Morgan Lee", "morgan@horizon.com", hash, cid1]);
        await pool.query("INSERT INTO users (name, email, password, role, company_id, status) VALUES ($1,$2,$3,'Employee',$4,'active') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id", ["Jordan Kim", "jordan@horizon.com", hash, cid1]);

        // Inventory
        await pool.query(`INSERT INTO inventory (company_id, sku, name, quantity, price, category) VALUES
            ($1,'HSY-001','Quantum Cloud Server',42,3499.99,'Hardware'),
            ($1,'HSY-002','Prism Load Balancer',18,1299.00,'Networking'),
            ($1,'HSY-003','NVMe SSD Array 8TB',65,799.50,'Storage'),
            ($1,'HSY-004','Fibre Optic Switch 48P',12,4200.00,'Networking'),
            ($1,'HSY-005','GPU Compute Module A100',8,9800.00,'Hardware'),
            ($1,'HSY-006','Enterprise UPS 10KVA',25,1500.00,'Infrastructure')
            ON CONFLICT (company_id, sku) DO NOTHING`, [cid1]);

        // Finance
        await pool.query(`INSERT INTO finance (company_id, type, amount, category, description, date) VALUES
            ($1,'Income',45000.00,'Sales','Q1 Enterprise License - NovaTech','2026-01-10'),
            ($1,'Income',128000.00,'Sales','Annual SaaS Subscription - GlobalCorp','2026-02-01'),
            ($1,'Expense',12000.00,'Operations','AWS Infrastructure February','2026-02-15'),
            ($1,'Income',32000.00,'Consulting','Cloud Migration Consulting - RetailX','2026-03-05'),
            ($1,'Expense',8500.00,'Payroll','Contractor Payments - March','2026-03-20'),
            ($1,'Expense',3200.00,'Marketing','SaaStr Conference Sponsorship','2026-03-28')
            ON CONFLICT DO NOTHING`, [cid1]);

        // ============================================================
        // COMPANY 2: Cyberdyne Manufacturing (Industrial / Hardware)
        // ============================================================
        console.log("→ Creating Cyberdyne Manufacturing...");
        const c2 = await pool.query(
            "INSERT INTO companies (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
            ["Cyberdyne Manufacturing"]
        );
        const cid2 = c2.rows[0].id;

        const cy_admin = await pool.query(
            "INSERT INTO users (name, email, password, role, company_id, status) VALUES ($1,$2,$3,'Admin',$4,'active') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id",
            ["Sarah Connor", "sarah@cyberdyne.com", hash, cid2]
        );
        const cy_mgr = await pool.query(
            "INSERT INTO users (name, email, password, role, company_id, status) VALUES ($1,$2,$3,'Manager',$4,'active') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id",
            ["Miles Dyson", "miles@cyberdyne.com", hash, cid2]
        );
        const cy_emp = await pool.query(
            "INSERT INTO users (name, email, password, role, company_id, status) VALUES ($1,$2,$3,'Employee',$4,'active') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id",
            ["John Reese", "john@cyberdyne.com", hash, cid2]
        );
        const cy_aid = cy_admin.rows[0].id, cy_mid = cy_mgr.rows[0].id, cy_eid = cy_emp.rows[0].id;

        await pool.query("INSERT INTO employees (company_id, user_id, department, position, join_date) VALUES ($1,$2,'Executive','Chief Operations Officer','2021-08-01') ON CONFLICT DO NOTHING", [cid2, cy_aid]);
        await pool.query("INSERT INTO employees (company_id, user_id, department, position, join_date) VALUES ($1,$2,'R&D','Head of Research','2021-09-15') ON CONFLICT DO NOTHING", [cid2, cy_mid]);
        await pool.query("INSERT INTO employees (company_id, user_id, department, position, join_date) VALUES ($1,$2,'Production','Floor Supervisor','2022-02-20') ON CONFLICT DO NOTHING", [cid2, cy_eid]);

        await pool.query("INSERT INTO users (name, email, password, role, company_id, status) VALUES ($1,$2,$3,'Employee',$4,'active') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id", ["Kate Brewster", "kate@cyberdyne.com", hash, cid2]);
        await pool.query("INSERT INTO users (name, email, password, role, company_id, status) VALUES ($1,$2,$3,'Employee',$4,'active') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id", ["Danny Avila", "danny@cyberdyne.com", hash, cid2]);

        // Inventory
        await pool.query(`INSERT INTO inventory (company_id, sku, name, quantity, price, category) VALUES
            ($1,'CDN-001','Titanium Alloy Frame T-800',120,4500.00,'Materials'),
            ($1,'CDN-002','Plasma Actuator Assembly',55,850.00,'Components'),
            ($1,'CDN-003','Industrial Control PLC v4',30,1200.00,'Electronics'),
            ($1,'CDN-004','CNC Precision Mill Bit Set',200,45.00,'Tooling'),
            ($1,'CDN-005','Hydraulic Press 200T',4,38000.00,'Machinery'),
            ($1,'CDN-006','Carbon Fiber Sheet 1.5mm',500,120.00,'Materials')
            ON CONFLICT (company_id, sku) DO NOTHING`, [cid2]);

        // Finance
        await pool.query(`INSERT INTO finance (company_id, type, amount, category, description, date) VALUES
            ($1,'Income',250000.00,'Manufacturing','Industrial Batch Contract - DefenseTech','2026-01-05'),
            ($1,'Expense',85000.00,'Materials','Raw Titanium Alloy Procurement Q1','2026-01-20'),
            ($1,'Income',140000.00,'Sales','Robotics Assembly Order #4421','2026-02-14'),
            ($1,'Expense',22000.00,'Operations','Factory Maintenance & Repairs','2026-02-28'),
            ($1,'Income',310000.00,'Manufacturing','Govt Contract - Defense Systems','2026-03-10'),
            ($1,'Expense',45000.00,'Payroll','Q1 Technician Salaries','2026-03-31')
            ON CONFLICT DO NOTHING`, [cid2]);

        // ============================================================
        // COMPANY 3: Nova Finance Group (Financial Services)
        // ============================================================
        console.log("→ Creating Nova Finance Group...");
        const c3 = await pool.query(
            "INSERT INTO companies (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id",
            ["Nova Finance Group"]
        );
        const cid3 = c3.rows[0].id;

        const nv_admin = await pool.query(
            "INSERT INTO users (name, email, password, role, company_id, status) VALUES ($1,$2,$3,'Admin',$4,'active') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id",
            ["Diana Prince", "diana@novafinance.com", hash, cid3]
        );
        const nv_mgr = await pool.query(
            "INSERT INTO users (name, email, password, role, company_id, status) VALUES ($1,$2,$3,'Manager',$4,'active') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id",
            ["Bruce Wayne", "bruce@novafinance.com", hash, cid3]
        );
        const nv_emp = await pool.query(
            "INSERT INTO users (name, email, password, role, company_id, status) VALUES ($1,$2,$3,'Employee',$4,'active') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id",
            ["Clark Kent", "clark@novafinance.com", hash, cid3]
        );
        const nv_aid = nv_admin.rows[0].id, nv_mid = nv_mgr.rows[0].id, nv_eid = nv_emp.rows[0].id;

        await pool.query("INSERT INTO employees (company_id, user_id, department, position, join_date) VALUES ($1,$2,'Executive','Chief Financial Officer','2020-03-01') ON CONFLICT DO NOTHING", [cid3, nv_aid]);
        await pool.query("INSERT INTO employees (company_id, user_id, department, position, join_date) VALUES ($1,$2,'Investment','Portfolio Manager','2020-05-15') ON CONFLICT DO NOTHING", [cid3, nv_mid]);
        await pool.query("INSERT INTO employees (company_id, user_id, department, position, join_date) VALUES ($1,$2,'Analysis','Financial Analyst','2021-09-01') ON CONFLICT DO NOTHING", [cid3, nv_eid]);

        await pool.query("INSERT INTO users (name, email, password, role, company_id, status) VALUES ($1,$2,$3,'Employee',$4,'active') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id", ["Lois Lane", "lois@novafinance.com", hash, cid3]);
        await pool.query("INSERT INTO users (name, email, password, role, company_id, status) VALUES ($1,$2,$3,'Employee',$4,'active') ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name RETURNING id", ["Lex Luthor", "lex@novafinance.com", hash, cid3]);

        // Inventory (office/IT assets for a finance firm)
        await pool.query(`INSERT INTO inventory (company_id, sku, name, quantity, price, category) VALUES
            ($1,'NFG-001','Bloomberg Terminal License',12,24000.00,'Software'),
            ($1,'NFG-002','Secure Trading Workstation',20,3800.00,'Hardware'),
            ($1,'NFG-003','HSM Security Module',6,12500.00,'Security'),
            ($1,'NFG-004','Dual 27" 4K Display Set',35,1200.00,'Hardware'),
            ($1,'NFG-005','Encrypted NAS Storage 50TB',4,8500.00,'Storage'),
            ($1,'NFG-006','VPN Appliance Enterprise',8,950.00,'Networking')
            ON CONFLICT (company_id, sku) DO NOTHING`, [cid3]);

        // Finance
        await pool.query(`INSERT INTO finance (company_id, type, amount, category, description, date) VALUES
            ($1,'Income',520000.00,'Investment Returns','Q1 Equity Portfolio Returns','2026-01-31'),
            ($1,'Expense',15000.00,'Operations','Bloomberg Data Subscription Q1','2026-02-01'),
            ($1,'Income',380000.00,'Advisory Fees','M&A Advisory - Stellar Corp','2026-02-20'),
            ($1,'Expense',28000.00,'Compliance','SEC Compliance Audit Fees','2026-03-01'),
            ($1,'Income',210000.00,'Trading','Derivative Gains March','2026-03-15'),
            ($1,'Expense',9500.00,'Operations','Secure Comms Infrastructure','2026-03-22')
            ON CONFLICT DO NOTHING`, [cid3]);

        // ============================================================
        // PERMISSIONS — Initialize for ALL companies and ALL roles
        // ============================================================
        console.log("→ Seeding permissions for all companies...");
        const modulesResult = await pool.query("SELECT id, name FROM modules");
        const modules = modulesResult.rows;
        const companies = [cid1, cid2, cid3];

        for (const cid of companies) {
            for (const module of modules) {
                await pool.query(
                    `INSERT INTO role_modules (company_id, role, module_id, can_view, can_add, can_edit, can_delete, can_copy)
                     VALUES ($1, 'Admin',    $2, true,  true,  true,  true,  true)  ON CONFLICT DO NOTHING`,
                    [cid, module.id]
                );
                await pool.query(
                    `INSERT INTO role_modules (company_id, role, module_id, can_view, can_add, can_edit, can_delete, can_copy)
                     VALUES ($1, 'Manager',  $2, true,  true,  true,  false, true)  ON CONFLICT DO NOTHING`,
                    [cid, module.id]
                );
                await pool.query(
                    `INSERT INTO role_modules (company_id, role, module_id, can_view, can_add, can_edit, can_delete, can_copy)
                     VALUES ($1, 'Employee', $2, true,  false, false, false, false) ON CONFLICT DO NOTHING`,
                    [cid, module.id]
                );
            }
        }

        // ============================================================
        // ACTIVITY LOGS (some DLP events per company)
        // ============================================================
        console.log("→ Seeding activity logs...");
        await pool.query(`INSERT INTO activity_logs (company_id, user_id, action, module, ip_address) VALUES
            ($1,$2,'LOGIN','Authentication','192.168.1.10'),
            ($1,$2,'VIEW_ALL','Inventory','192.168.1.10'),
            ($1,$3,'CREATE_ITEM','Inventory','192.168.1.22'),
            ($1,$3,'VIEW_ALL','Finance','192.168.1.22'),
            ($1,$4,'LOGIN','Authentication','10.0.0.5')
            ON CONFLICT DO NOTHING`,
            [cid1, h_aid, h_mid, h_eid]
        );
        await pool.query(`INSERT INTO activity_logs (company_id, user_id, action, module, ip_address) VALUES
            ($1,$2,'LOGIN','Authentication','10.10.5.1'),
            ($1,$2,'DELETE_ITEM','Inventory','10.10.5.1'),
            ($1,$3,'VIEW_ALL','Employees','10.10.5.8'),
            ($1,$3,'CREATE_RECORD','Finance','10.10.5.8'),
            ($1,$4,'LOGIN','Authentication','10.10.5.20')
            ON CONFLICT DO NOTHING`,
            [cid2, cy_aid, cy_mid, cy_eid]
        );
        await pool.query(`INSERT INTO activity_logs (company_id, user_id, action, module, ip_address) VALUES
            ($1,$2,'LOGIN','Authentication','172.16.0.1'),
            ($1,$2,'VIEW_ALL','Finance','172.16.0.1'),
            ($1,$3,'UPDATE_RECORD','Finance','172.16.0.14'),
            ($1,$3,'VIEW_ALL','Reports','172.16.0.14'),
            ($1,$4,'LOGIN','Authentication','172.16.0.30')
            ON CONFLICT DO NOTHING`,
            [cid3, nv_aid, nv_mid, nv_eid]
        );

        console.log("\n✅ All demo data seeded successfully!\n");
        console.log("════════════════════════════════════════════════════════");
        console.log("  DEMO LOGIN CREDENTIALS (password: password123)");
        console.log("════════════════════════════════════════════════════════\n");

        console.log("🏢 HORIZON SYSTEMS (Tech/SaaS)");
        console.log("  Admin    → alex@horizon.com");
        console.log("  Manager  → jamie@horizon.com");
        console.log("  Employee → taylor@horizon.com\n");

        console.log("🏭 CYBERDYNE MANUFACTURING (Industrial)");
        console.log("  Admin    → sarah@cyberdyne.com");
        console.log("  Manager  → miles@cyberdyne.com");
        console.log("  Employee → john@cyberdyne.com\n");

        console.log("💼 NOVA FINANCE GROUP (Financial Services)");
        console.log("  Admin    → diana@novafinance.com");
        console.log("  Manager  → bruce@novafinance.com");
        console.log("  Employee → clark@novafinance.com\n");

        console.log("════════════════════════════════════════════════════════\n");

    } catch (error) {
        console.error("❌ Seeding Error:", error.message);
        throw error;
    }
};

// Run directly
if (process.argv[1].endsWith("seed.js")) {
    seedData(pool).finally(() => pool.end());
}

export { seedData };
