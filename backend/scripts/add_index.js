const db = require('../config/db');

async function addIndex() {
    console.log('Adding INDEX to produk(nama_produk)...');
    try {
        await db.query('CREATE INDEX idx_nama_produk ON produk(nama_produk)');
        console.log('Index created successfully!');
        process.exit(0);
    } catch (err) {
        console.error('Failed to create index:', err.message);
        process.exit(1);
    }
}

addIndex();
