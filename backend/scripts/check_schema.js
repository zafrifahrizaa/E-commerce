const db = require('../config/db');

async function checkSchema() {
    try {
        const tableNames = ['ecommerce', 'produk', 'users', 'roles', 'permissions', 'role_permissions'];

        for (const tableName of tableNames) {
            try {
                const [columns] = await db.query(`DESCRIBE ${tableName}`);
                console.log(`\nColumns for ${tableName}:`);
                columns.forEach(col => {
                    console.log(`${col.Field} (${col.Type})`);
                });
            } catch (err) {
                console.log(`\nTable ${tableName} error:`, err.message);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
}

checkSchema();
