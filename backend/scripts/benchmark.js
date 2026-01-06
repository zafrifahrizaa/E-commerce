// Node versi 18 ke atas sudah memiliki fungsi fetch bawaan (native).

async function runBenchmark() {
    console.log('=== MULAI STRESS TEST ===');
    const baseUrl = 'http://localhost:5000/api/dashboard';

    // Proses Login untuk mendapatkan Token Akses
    console.log('Login sebagai Editor...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'editor', password: 'password123' }) // Sesuai debug
    });
    const loginData = await loginRes.json();
    const token = loginData.token;

    if (!token) {
        console.error('Gagal login!', loginData);
        process.exit(1);
    }

    const headers = { 'Authorization': `Bearer ${token}` };

    // SKENARIO 1: Mengambil data dengan Pagination (10 item per halaman)
    console.log('\n--- Skenario 1: Dengan Pagination (100 Request) ---');
    const start1 = performance.now();
    let errors1 = 0;
    const reqs = 100;

    for (let i = 0; i < reqs; i++) {
        try {
            const res = await fetch(`${baseUrl}?page=1&limit=10`, { headers });
            if (!res.ok) errors1++;
        } catch (e) { errors1++; }
    }
    const end1 = performance.now();
    const avg1 = (end1 - start1) / reqs;
    console.log(`Total Waktu: ${(end1 - start1).toFixed(2)} ms`);
    console.log(`Rata-rata: ${avg1.toFixed(2)} ms/request`);
    console.log(`Error: ${errors1}`);

    // SKENARIO 2: Mengambil semua data sekaligus (Tanpa Pagination)
    console.log('\n--- Skenario 2: Tanpa Pagination (Load Semua Data) ---');
    console.log('Mengambil 1 request data besar (hati-hati memory)...');

    const start2 = performance.now();
    try {
        const res = await fetch(`${baseUrl}/all`, { headers });
        const data = await res.json();
        console.log(`Jumlah Data Diterima: ${data.data ? data.data.length : 'Unknown'}`);
    } catch (e) {
        console.error('Gagal load all data:', e.message);
    }
    const end2 = performance.now();
    console.log(`Total Waktu: ${(end2 - start2).toFixed(2)} ms`);

    // SKENARIO 3: Melakukan Pencarian (Operasi SQL LIKE yang cukup berat)
    console.log('\n--- Skenario 3: Pencarian "a" (10 Request) ---');
    const start3 = performance.now();
    for (let i = 0; i < 10; i++) {
        await fetch(`${baseUrl}?search=a&limit=10`, { headers });
    }
    const end3 = performance.now();
    console.log(`Total Waktu: ${(end3 - start3).toFixed(2)} ms`);
    console.log(`Rata-rata: ${((end3 - start3) / 10).toFixed(2)} ms/request`);

    // SKENARIO 4: Pengurutan data berdasarkan Nama Produk (Target Indeks Database)
    console.log('\n--- Skenario 4: Sort by Nama Produk (10 Request) ---');
    const start4 = performance.now();
    for (let i = 0; i < 10; i++) {
        await fetch(`${baseUrl}?sort=nama_produk&limit=10`, { headers });
    }
    const end4 = performance.now();
    console.log(`Total Waktu: ${(end4 - start4).toFixed(2)} ms`);
    console.log(`Rata-rata: ${((end4 - start4) / 10).toFixed(2)} ms/request`);


    console.log('\n=== ANALISIS ===');
    if ((end2 - start2) > avg1 * 100) {
        console.log('KESIMPULAN: Load tanpa pagination JAUH lebih lambat. Dibutuhkan optimasi.');
    }
}

// Tambahan fungsi pendukung jika versi Node yang digunakan versi lama (Polyfill)
if (typeof performance === 'undefined') {
    global.performance = { now: () => Date.now() };
}

runBenchmark();
