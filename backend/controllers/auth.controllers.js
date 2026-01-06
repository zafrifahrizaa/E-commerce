const db = require('../config/db');

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await db.query(
            `SELECT u.*, r.nama_role 
             FROM users u 
             JOIN roles r ON u.id_role = r.id_role 
             WHERE u.email = ?`,
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ message: 'User not found!' });
        }

        const user = rows[0];

        // Validate password (plain text for now as seeded)
        if (password !== user.password) {
            return res.status(401).json({ message: 'Password salah!' });
        }

        // Return user info
        res.json({
            token: `dummy-token-${user.nama_role}`, // Simulating token
            role: user.nama_role.toLowerCase(), // 'admin', 'editor', 'viewer'
            username: user.username,
            name: user.nama_lengkap,
            email: user.email,
            id: user.id_user
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
