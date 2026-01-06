const db = require('../config/db');

// Pagination
exports.getDashboardData = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        const search = req.query.search || '';
        const sort = req.query.sort || 'id_produk';
        const order = req.query.order || 'ASC';

        const searchCondition = search ? `WHERE nama_produk LIKE '%${search}%'` : '';

        const allowedSorts = ['id_produk', 'nama_produk', 'harga', 'stok'];
        const validSort = allowedSorts.includes(sort) ? sort : 'id_produk';
        const validOrder = (order.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';

        const query = `
            SELECT id_produk, nama_produk, harga, stok, id_kategori 
            FROM produk 
            ${searchCondition}
            ORDER BY ${validSort} ${validOrder}
            LIMIT ? OFFSET ?
        `;

        const [rows] = await db.query(query, [limit, offset]);

        const [countResult] = await db.query(`SELECT COUNT(*) as total, SUM(stok) as totalStock FROM produk ${searchCondition}`);
        const totalItems = countResult[0].total;
        const totalStock = countResult[0].totalStock || 0; 
        const totalPages = Math.ceil(totalItems / limit);

        res.json({
            data: rows,
            meta: {
                totalItems,
                totalStock,
                totalPages,
                currentPage: page,
                itemsPerPage: limit
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Non-pagination
exports.getAllDashboardData = async (req, res) => {
    try {
       
        const query = `SELECT id_produk, nama_produk, harga, stok, id_kategori FROM produk LIMIT 5000`;

        const [rows] = await db.query(query);

        res.json({
            data: rows,
            count: rows.length
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error: Data too large?' });
    }
};
