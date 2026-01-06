const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

// Konfigurasi Middleware (CORS untuk akses lintas domain & pengambilan JSON)
app.use(cors());
app.use(bodyParser.json());

// Mengimpor Rute-rute API (Auth, Admin, Dashboard)
const authRoutes = require('./routes/auth.routes');
const adminRoutes = require('./routes/admin.routes');

// Mendaftarkan Rute ke dalam aplikasi Express
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dashboard', require('./routes/dashboard.routes'));

const path = require('path');
// Menyediakan file statis (HTML, CSS, JS) dari folder frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Penanganan rute akhir (Fallback) untuk Single Page Application
app.get('*', (req, res) => {
    // If accessing API, ignore (api routes are matched above). 
    // If unrelated, send index.html or 404. 
    // For simplicity, just let static handle it.
    if (req.path.startsWith('/api')) return res.status(404).json({ message: 'API Not Found' });
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Menjalankan server pada port yang ditentukan
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
