// Node versi 18 ke atas sudah memiliki fungsi fetch bawaan (native).

async function testDashboard() {
    try {
        console.log('Testing Dashboard API...');
        // 1. Proses Login untuk mendapatkan Token Akses (sebagai Admin)
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@test.com', password: '123' })
        });

        if (!loginRes.ok) {
            console.error('Login Failed:', await loginRes.text());
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Token received:', token);

        // 2. Mengambil data dari Dashboard menggunakan Token yang didapat
        const dashRes = await fetch('http://localhost:5000/api/dashboard?page=1&limit=5', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!dashRes.ok) {
            console.error('Dashboard Fetch Failed:', await dashRes.text());
            return;
        }

        const dashData = await dashRes.json();
        console.log('Dashboard Data Status:', dashRes.status);
        if (dashData.data && dashData.data.length > 0) {
            console.log('Data Found:', dashData.data[0]);
            console.log('Total Items:', dashData.meta.totalItems);
        } else {
            console.log('No Data returned!');
            console.log(dashData);
        }

    } catch (err) {
        console.error('Error:', err);
    }
}

testDashboard();
