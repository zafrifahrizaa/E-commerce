const db = require('../config/db');

async function checkUsers() {
    const [rows] = await db.query('SELECT username, password, email FROM users');
    console.log('Users found:', rows);
    process.exit(0);
}

checkUsers();
