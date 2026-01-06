const db = require('../config/db');

async function fixAdmin() {
    console.log('Fixing Admin Credentials...');
    try {
        // Update Admin to user's preferred credentials
        await db.query(
            `UPDATE users 
             SET email = 'admin@test.com', password = '123' 
             WHERE username = 'admin'`
        );
        console.log('Admin updated: email=admin@test.com, password=123');

        // Verify Editor exists for testing too
        await db.query(
            `UPDATE users 
             SET email = 'editor@test.com', password = '123' 
             WHERE username = 'editor'`
        );
        console.log('Editor updated: email=editor@test.com, password=123');

        // Update Viewer
        await db.query(
            `UPDATE users 
             SET email = 'viewer@test.com', password = '123' 
             WHERE username = 'viewer'`
        );

        process.exit(0);
    } catch (err) {
        console.error('Failed:', err);
        process.exit(1);
    }
}

fixAdmin();
