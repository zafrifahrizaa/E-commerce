// Middleware untuk memverifikasi apakah Token Akses valid
module.exports = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    // Memeriksa apakah Header Authorization dikirimkan
    if (!authHeader) {
        return res.status(401).json({ message: 'Akses Ditolak: Tidak ada token!' });
    }

    // Mengambil token dari format: "Bearer <token>"
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Akses Ditolak: Token format salah!' });
    }

    // PROSES VALIDASI TOKEN (MENGGUNAKAN SIMULASI TOKEN)
    // Format simulasi token kita: "dummy-token-PERAN" (contoh: "dummy-token-admin")
    if (token.startsWith("dummy-token-")) {
        const role = token.split("-")[2].toLowerCase(); // ambil kata ketiga: admin/editor/viewer lalu lowercase

        // Menyimpan data user ke dalam request agar bisa digunakan di controller/route
        req.user = {
            token: token,
            role: role
        };
        next();
    } else {
        return res.status(403).json({ message: 'Token tidak valid!' });
    }
};