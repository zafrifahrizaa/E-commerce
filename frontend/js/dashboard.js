let state = {
  page: 1,
  limit: 10,
  search: "",
  sort: "id_produk",
  totalPages: 1
};

const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toLowerCase().trim();
const isAdmin = role === "admin";
const isEditor = role === "editor" || role === "staff";
const isViewer = !isAdmin && !isEditor;

// PROSES AWAL SAAT HALAMAN DIMUAT
document.addEventListener("DOMContentLoaded", () => {
  // Memperbarui teks pada lencana peran (Admin/Editor/Viewer)
  const badge = document.getElementById("roleBadge");
  if (badge) badge.innerText = role;

  loadProduk();

  // Menambahkan fungsi pada elemen-elemen UI (Event Listeners)
  document.getElementById("searchInput").addEventListener("input", (e) => {
    state.search = e.target.value;
    state.page = 1;
    loadProduk();
  });

  document.getElementById("sortSelect").addEventListener("change", (e) => {
    state.sort = e.target.value;
    loadProduk();
  });

  document.getElementById("prev").onclick = () => {
    if (state.page > 1) {
      state.page--;
      loadProduk();
    }
  };

  document.getElementById("next").onclick = () => {
    if (state.page < state.totalPages) {
      state.page++;
      loadProduk();
    }
  };

  // TOMBOL MODE TANPA PAGINATION (Pengalihan Halaman)
  const btnNonPaging = document.getElementById("btnNonPaging");
  if (btnNonPaging) {
    btnNonPaging.onclick = () => window.location.href = "non-pagination.html";
  }

  // BTN ADMIN PAGE - Handled inline in HTML

  // TOMBOL TAMBAH PRODUK (Hanya muncul jika perannya Admin atau Editor)
  const btnActions = document.querySelector(".actions");
  if ((isAdmin || isEditor) && btnActions) {
    const btnAdd = document.createElement("button");
    btnAdd.className = "btn-admin btn-small";
    btnAdd.innerText = "+ Tambah Produk";
    btnAdd.style.background = "#3b82f6";
    btnAdd.style.marginRight = "10px";
    btnAdd.onclick = () => openModal();
    btnActions.prepend(btnAdd);
  }
});

// FUNGSI UNTUK MENGAMBIL DATA DARI SERVER (API)
function loadProduk() {
  const { page, limit, search, sort } = state;
  const url = `http://localhost:5000/api/dashboard?page=${page}&limit=${limit}&search=${search}&sort=${sort}`;

  fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => res.json())
    .then(data => {
      renderProduk(data.data || []);

      const meta = data.meta || data;
      state.totalPages = meta.totalPages || 1;
      updatePagination(meta);

      // MEMPERBARUI STATISTIK PADA DASHBOARD (Jika elemennya ada)
      if (document.getElementById("totalProduk")) {
        document.getElementById("totalProduk").innerText = meta.totalItems || 0;
      }
      if (document.getElementById("totalStok")) {
        document.getElementById("totalStok").innerText = meta.totalStock || 0;
      }
    })
    .catch(err => console.error("Error loading data:", err));
}

// FUNGSI UNTUK MERENDER ATAU MENAMPILKAN DATA KE DALAM TABEL HTML
function renderProduk(data) {
  const tbody = document.querySelector("#produk-table tbody");
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;">Tidak ada data</td></tr>`;
    return;
  }

  // Mengatur visibilitas kolom "Aksi" berdasarkan peran user
  const headerAksi = document.getElementById("headerAksi");
  if (headerAksi) {
    if (isViewer) {
      headerAksi.style.display = "none";
    } else {
      headerAksi.style.display = ""; // Reset default
    }
  }

  data.forEach(p => {
    // MENGUBAH ANGKA HARGA KE FORMAT RUPIAH
    const harga = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(p.harga);

    // MENAMPILKAN BADGE STATUS (Tersedia atau Habis) TERGANTUNG STOK
    const statusBadge = p.stok > 0
      ? `<span style="background:#d1fae5; color:#065f46; padding:4px 8px; border-radius:12px; font-size:12px;">Tersedia</span>`
      : `<span style="background:#fee2e2; color:#991b1b; padding:4px 8px; border-radius:12px; font-size:12px;">Habis</span>`;

    // MENGATUR TOMBOL AKSI BERDASARKAN HAK AKSES (RBAC)
    let actions = "";
    const productData = JSON.stringify(p).replace(/"/g, "&quot;");

    if (isAdmin || isEditor) {
      actions = `
        <button class="btn-edit" data-id="${p.id_produk}" data-product="${productData}" style="background:#f59e0b; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Edit</button>
        <button class="btn-delete" data-id="${p.id_produk}" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Hapus</button>
      `;
    }

    let actionCell = "";
    if (!isViewer) {
      actionCell = `<td style="display:flex; gap:5px; justify-content: center;">${actions}</td>`;
    }

    const row = `
      <tr>
        <td>${p.id_produk}</td>
        <td>${p.nama_produk}</td>
        <td>${p.id_kategori || '-'}</td>
        <td>${harga}</td>
        <td>${p.stok}</td>
        <td>${statusBadge}</td>
        ${actionCell}
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// MEMPERBARUI INFORMASI HALAMAN DAN KONTROL PAGINATION
function updatePagination(data) {
  const info = document.getElementById("pageInfo");
  if (info) {
    // data here is meta from backend: { totalItems, totalPages, currentPage }
    const total = data.totalItems ? data.totalItems.toLocaleString('id-ID') : '0';
    info.innerText = `Page ${state.page} of ${state.totalPages} (Total: ${total})`;
  }

  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");

  if (prevBtn) {
    prevBtn.disabled = state.page <= 1;
    prevBtn.style.opacity = state.page <= 1 ? "0.5" : "1";
  }
  if (nextBtn) {
    nextBtn.disabled = state.page >= state.totalPages;
    nextBtn.style.opacity = state.page >= state.totalPages ? "0.5" : "1";
  }
}

// FUNGSI UNTUK MENGATUR FORM POP-UP (MODAL)
function openModal(product = null) {
  const modal = document.getElementById("productModal");
  const title = document.getElementById("modalTitle");
  const form = document.getElementById("productForm");

  modal.style.display = "block";

  if (product) {
    title.innerText = "Edit Produk";
    document.getElementById("productId").value = product.id_produk;
    document.getElementById("nama").value = product.nama_produk;
    document.getElementById("kategori").value = product.id_kategori;
    document.getElementById("harga").value = product.harga;
    document.getElementById("stok").value = product.stok;
  } else {
    title.innerText = "Tambah Produk";
    form.reset();
    document.getElementById("productId").value = "";
  }
}

function closeModal() {
  document.getElementById("productModal").style.display = "none";
}

// MENANGANI PROSES SIMPAN DATA DARI FORM (POST UNTUK BARU, PUT UNTUK EDIT)
document.getElementById("productForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("productId").value;
  const data = {
    nama: document.getElementById("nama").value,
    kategori: document.getElementById("kategori").value,
    harga: document.getElementById("harga").value,
    stok: document.getElementById("stok").value
  };

  const method = id ? "PUT" : "POST";
  const url = id
    ? `http://localhost:5000/api/admin/produk/${id}`
    : `http://localhost:5000/api/admin/produk`;

  try {
    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    if (res.ok) {
      alert("Berhasil!");
      closeModal();
      loadProduk();
    } else {
      alert("Gagal menyimpan data");
    }
  } catch (err) {
    console.error(err);
  }
});

// MENGATUR KLIK PADA TOMBOL DI DALAM TABEL (EDIT & HAPUS)
document.querySelector("#produk-table tbody").addEventListener("click", async (e) => {
  if (e.target.classList.contains("btn-edit")) {
    const productData = JSON.parse(e.target.dataset.product);
    openModal(productData);
  }
  if (e.target.classList.contains("btn-delete")) {
    const id = e.target.dataset.id;
    if (confirm(`Hapus produk ID ${id}?`)) {
      await fetch(`http://localhost:5000/api/admin/produk/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      loadProduk();
    }
  }
});
