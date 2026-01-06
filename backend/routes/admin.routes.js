const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controllers');

const authenticate = require('../middleware/auth');
const authorize = require('../middleware/role');

// Endpoint untuk mengambil produk dengan fitur Pagination (Halaman)
router.get('/produk', authenticate, adminController.getProduk);

// Endpoint untuk mengambil semua produk tanpa pagination - KHUSUS ADMIN
router.get(
    '/produk/all',
    authenticate,
    authorize(['admin']),
    adminController.getAllProduk
);

// Endpoint untuk menambahkan produk baru - ADMIN & EDITOR SAJA
router.post(
    '/produk',
    authenticate,
    authorize(['admin', 'editor', 'staff']),
    adminController.createProduk
);

// Endpoint untuk memperbarui data produk berdasarkan ID - ADMIN & EDITOR SAJA
router.put(
    '/produk/:id',
    authenticate,
    authorize(['admin', 'editor', 'staff']),
    adminController.updateProduk
);

// Endpoint untuk menghapus produk berdasarkan ID - ADMIN & EDITOR SAJA
router.delete(
    '/produk/:id',
    authenticate,
    authorize(['admin', 'editor', 'staff']),
    adminController.deleteProduk
);

module.exports = router;
