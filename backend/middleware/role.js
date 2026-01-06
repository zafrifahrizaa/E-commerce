// Middleware untuk memverifikasi hak akses berdasarkan Peran (Admin/Editor/Viewer)
module.exports = (roles = []) => {
    // Parameter roles bisa dikirimkan berupa string tunggal atau array beberapa string
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return (req, res, next) => {
        const userRole = (req.user && req.user.role) ? req.user.role.trim().toLowerCase() : '';
        const allowedRoles = roles.map(r => r.trim().toLowerCase());

        if (!req.user || !allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: '403 Forbidden: Hak akses ditolak!',
                debug: `Role Anda: "${userRole}", Role yang diizinkan: [${allowedRoles.join(', ')}]`
            });
        }
        next();
    };
};