const db = require('../config/db');
const { faker } = require('@faker-js/faker');

async function seed() {
    console.log('Starting seeding process...');
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Seed Roles
        console.log('Seeding Roles...');
        const roles = [
            { id: 1, name: 'Admin', desc: 'Administrator with full access' },
            { id: 2, name: 'Editor', desc: 'Can edit content' },
            { id: 3, name: 'Viewer', desc: 'Read-only access' }
        ];

        for (const role of roles) {
            await connection.query(
                'INSERT INTO roles (id_role, nama_role, deskripsi) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE nama_role=VALUES(nama_role)',
                [role.id, role.name, role.desc]
            );
        }

        // 2. Seed Users (passwords are 'password123' hashed - normally crypto/bcrypt, but plain or simple for dummy)
        // Note: In real app use bcrypt. Here assuming simple or hashing later.
        // For simplicity reusing user create logic or just direct insert.
        console.log('Seeding Users...');
        const users = [
            { username: 'admin', role: 1 },
            { username: 'editor', role: 2 },
            { username: 'viewer', role: 3 }
        ];

        for (const u of users) {
            // Checking if user exists
            const [rows] = await connection.query('SELECT * FROM users WHERE username = ?', [u.username]);
            if (rows.length === 0) {
                await connection.query(
                    'INSERT INTO users (username, password, email, nama_lengkap, id_role, is_active) VALUES (?, ?, ?, ?, ?, 1)',
                    [u.username, 'password123', `${u.username}@example.com`, `${u.username} User`, u.role]
                );
            }
        }

        // 3. Seed Category (needed for product FK)
        console.log('Seeding Category...');
        await connection.query('INSERT IGNORE INTO kategori (id_kategori, nama_kategori) VALUES (1, "General")');
        // If that fails due to schema, we might need to check column names. Assuming id_kategori, nama_kategori.
        // Let's assume standard names given previous conventions.

        // 4. Seed Products (500k)
        console.log('Checking Product Count...');
        const [res] = await connection.query('SELECT COUNT(*) as count FROM produk');
        let currentCount = res[0].count;
        const targetCount = 500000;

        if (currentCount < targetCount) {
            console.log(`Current products: ${currentCount}. Generating ${targetCount - currentCount} more...`);

            const batchSize = 10000; // Batch insert size
            let inserted = 0;
            const needed = targetCount - currentCount;

            for (let i = 0; i < needed; i += batchSize) {
                const chunk = [];
                const limit = Math.min(batchSize, needed - i);

                for (let j = 0; j < limit; j++) {
                    chunk.push([
                        faker.commerce.productName(),
                        parseFloat(faker.commerce.price({ min: 10, max: 1000, dec: 2 })),
                        faker.number.int({ min: 0, max: 1000 }), // stok
                        1 // id_kategori
                    ]);
                }

                await connection.query(
                    'INSERT INTO produk (nama_produk, harga, stok, id_kategori) VALUES ?',
                    [chunk]
                );

                inserted += limit;
                if (inserted % 50000 === 0) console.log(`Inserted ${inserted} products...`);
            }
        } else {
            console.log('Product table already has sufficient data.');
        }

        await connection.commit();
        console.log('Seeding completed successfully!');
        process.exit(0);

    } catch (err) {
        await connection.rollback();
        console.error('Seeding failed:', err);
        process.exit(1);
    } finally {
        connection.release();
    }
}

seed();
