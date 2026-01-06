const db = require('../config/db');

// Endpoint untuk mengambil produk dengan pagination (halaman per halaman)
exports.getProduk = async (req, res) => {
    try {
        let { page, limit, search, sort, order } = req.query;

        // Pengaturan nilai default jika parameter tidak dikirimkan
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 10;
        const offset = (page - 1) * limit;
        search = search ? `%${search.toLowerCase()}%` : '%';

        // Mencegah SQL Injection untuk kolom sort dan arah order
        const allowedSorts = ['id_produk', 'nama_produk', 'harga', 'stok'];
        const validSort = allowedSorts.includes(sort) ? sort : 'id_produk';
        const validOrder = (order && order.toUpperCase() === 'DESC') ? 'DESC' : 'ASC';

        const [rows] = await db.query(
            `SELECT id_produk, nama_produk, harga, stok, id_kategori 
             FROM produk 
             WHERE nama_produk LIKE ? 
             ORDER BY ${validSort} ${validOrder} 
             LIMIT ? OFFSET ?`,
            [search, limit, offset]
        );

        const [countResult] = await db.query(
            `SELECT COUNT(*) as total FROM produk WHERE nama_produk LIKE ?`,
            [search]
        );

        const totalItems = countResult[0].total;
        const totalPages = Math.ceil(totalItems / limit);

        res.json({
            data: rows,
            totalData: totalItems,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Endpoint untuk mengambil semua produk sekaligus (Tanpa Pagination)
exports.getAllProduk = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id_produk, nama_produk, harga, stok, id_kategori FROM produk LIMIT 5000');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Endpoint untuk menambahkan produk baru (Hanya Admin/Editor)
exports.createProduk = async (req, res) => {
    try {
        const { nama, kategori, harga, stok } = req.body;

        // Pemetaan kategori: Untuk saat ini kita gunakan default 1 (Umum)
        // dari data yang sudah di-seed sebelumnya.
        const id_kategori = 1;

        const [result] = await db.query(
            'INSERT INTO produk (nama_produk, harga, stok, id_kategori) VALUES (?, ?, ?, ?)',
            [nama, parseFloat(harga) || 0, parseInt(stok) || 0, id_kategori]
        );

        res.status(201).json({
            message: 'Produk berhasil ditambahkan',
            data: { id_produk: result.insertId, nama_produk: nama, harga, stok, id_kategori }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Endpoint untuk memperbarui data produk berdasarkan ID
exports.updateProduk = async (req, res) => {
    try {
        const id_produk = req.params.id;
        const { nama, kategori, harga, stok } = req.body;

        const [result] = await db.query(
            'UPDATE produk SET nama_produk = ?, harga = ?, stok = ? WHERE id_produk = ?',
            [nama, parseFloat(harga) || 0, parseInt(stok) || 0, id_produk]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }

        res.json({ message: 'Produk berhasil diupdate' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Endpoint untuk menghapus produk berdasarkan ID
exports.deleteProduk = async (req, res) => {
    try {
        const id_produk = req.params.id;
        const [result] = await db.query('DELETE FROM produk WHERE id_produk = ?', [id_produk]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Produk tidak ditemukan' });
        }

        res.json({ message: 'Produk berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
