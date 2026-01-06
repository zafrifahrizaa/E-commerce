document.addEventListener("DOMContentLoaded", () => {
  const isLogin = localStorage.getItem("isLogin");
  const role = (localStorage.getItem("role") || "").toLowerCase().trim();
  const isAdmin = role === "admin";
  const isEditor = role === "editor" || role === "staff";
  const isViewer = !isAdmin && !isEditor;

  // CEK LOGIN
  console.log("Checking Login Status...");
  console.log("isLogin:", isLogin);
  console.log("role:", role);

  if (!isLogin || !role) {
    console.log("Redirecting to index.html because login status invalid");
    window.location.href = "index.html";
    return;
  }

  // PENGECEKAN TINGKAT HALAMAN: Alihkan jika user tidak punya izin akses halaman ini
  // Di sini hanya dashboard, jadi semua role boleh akses dashboard.
  // Tapi jika ada halaman user_management.html, kita bisa cek di sini.

  // PENYEMBUNYIAN ELEMEN BERDASARKAN PERAN (RBAC)
  // 1. KHUSUS ADMIN: Hanya Admin yang bisa melihat
  // 2. KHUSUS EDITOR: Admin & Editor boleh melihat (Viewer tidak boleh)
  // 3. KHUSUS VIEWER: Semua peran bisa melihat (biasanya hanya baca data)

  const adminElements = document.querySelectorAll(".admin-only");
  const editorElements = document.querySelectorAll(".editor-only");

  // Sembunyikan elemen khusus Admin jika perannya bukan Admin
  if (!isAdmin) {
    adminElements.forEach(el => {
      // Kecuali jika ada aturan lain, defaultnya hide
      el.style.display = "none";
    });
  }

  // Sembunyikan elemen Editor (seperti tombol aksi) jika perannya hanya Viewer
  if (isViewer) {
    editorElements.forEach(el => el.style.display = "none");
  }

  // MENGUBAH JUDUL DASHBOARD SESUAI PERAN USER
  const title = document.querySelector(".topbar h2");
  if (title) {
    title.textContent = `Dashboard ${role.toUpperCase()}`;
  }

  // Update badge role
  const badge = document.getElementById("roleBadge");
  if (badge) badge.innerText = role;

  // MENYEDIAKAN FUNGSI LOGOUT AGAR BISA DIPANGGIL DARI MANA SAJA
  window.logout = function () {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    localStorage.removeItem("isLogin"); // Just in case
    window.location.href = "index.html";
  };
});
