document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = emailInput.value;
            const password = passwordInput.value;

            try {
                const response = await fetch('http://localhost:5000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // Jika Login Berhasil
                    alert('Login Berhasil!');

                    // Simpan data login ke LocalStorage untuk digunakan di halaman lain
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('isLogin', 'true'); // Penanda bahwa user sudah login
                    localStorage.setItem('role', data.role); // Peran user (Admin/Editor/Viewer)
                    localStorage.setItem('user', JSON.stringify({
                        name: data.name,
                        email: data.email,
                        role: data.role
                    }));

                    // Pindahkan ke halaman Dashboard
                    window.location.href = 'dashboard.html';
                } else {
                    // Jika Login Gagal (Password salah / User tidak ada)
                    alert(data.message || 'Login Gagal!');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Terjadi kesalahan pada server!');
            }
        });
    }
});