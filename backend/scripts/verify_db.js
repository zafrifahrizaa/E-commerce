const db = require('../config/db');

async function verifySource() {
    console.log('--- CONNECTED TO DATABASE: penjualan_online ---');

    try {
        const [tables] = await db.query('SHOW TABLES');
        const validTables = tables.map(t => Object.values(t)[0]);
        console.log('Tables found in DB:', validTables);

        // Check specific row counts
        for (const tbl of validTables) {
            const [res] = await db.query(`SELECT COUNT(*) as count FROM ${tbl}`);
            console.log(`- ${tbl}: ${res[0].count} rows`);
        }

    } catch (err) {
        console.error('Error:', err.message);
    }
    process.exit(0);
}

verifySource();
