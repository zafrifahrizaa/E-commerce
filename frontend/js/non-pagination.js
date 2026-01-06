let state = {
    search: "",
    sort: "id_produk"
};

const token = localStorage.getItem("token");
const role = (localStorage.getItem("role") || "").toLowerCase().trim();
const isAdmin = role === "admin";
const isEditor = role === "editor" || role === "staff";
const isViewer = !isAdmin && !isEditor;

document.addEventListener("DOMContentLoaded", () => {
    loadAllProduk();

    // Search & Sort Listeners
    document.getElementById("searchInput").addEventListener("input", (e) => {
        state.search = e.target.value;
        loadAllProduk();
    });

    document.getElementById("sortSelect").addEventListener("change", (e) => {
        state.sort = e.target.value;
        loadAllProduk();
    });

    // Form Submit Listener
    document.getElementById("productForm").addEventListener("submit", handleFormSubmit);

    // Table Delegation for Edit/Delete
    document.querySelector("#produk-table tbody").addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-edit")) {
            const product = JSON.parse(e.target.dataset.product);
            openModal(product);
        }
        if (e.target.classList.contains("btn-delete")) {
            const id = e.target.dataset.id;
            deleteProduk(id);
        }
    });
});

function loadAllProduk() {
    const { search, sort } = state;
    const url = `http://localhost:5000/api/dashboard/all?search=${search}&sort=${sort}`;
    const statusInfo = document.getElementById("statusInfo");

    statusInfo.innerText = "Memuat data (Limit 5.000 untuk stabilitas)...";

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
            renderTable(data.data || []);
            statusInfo.innerText = `Menampilkan Semua Data (${data.data ? data.data.length : 0} item) - Capped at 5,000`;
        })
        .catch(err => {
            console.error(err);
            statusInfo.innerText = "Gagal memuat data.";
        });
}

function renderTable(data) {
    const tbody = document.querySelector("#produk-table tbody");
    const headerAksi = document.getElementById("headerAksi");
    tbody.innerHTML = "";

    if (isViewer && headerAksi) headerAksi.style.display = "none";

    data.forEach(p => {
        const harga = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(p.harga);
        const statusBadge = p.stok > 0
            ? `<span style="background:#d1fae5; color:#065f46; padding:4px 8px; border-radius:12px; font-size:12px;">Tersedia</span>`
            : `<span style="background:#fee2e2; color:#991b1b; padding:4px 8px; border-radius:12px; font-size:12px;">Habis</span>`;

        let actions = "";
        if (isAdmin || isEditor) {
            const productData = JSON.stringify(p).replace(/"/g, "&quot;");
            actions = `
                <td style="display:flex; gap:5px; justify-content: center;">
                    <button class="btn-edit" data-product="${productData}" style="background:#f59e0b; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Edit</button>
                    <button class="btn-delete" data-id="${p.id_produk}" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Hapus</button>
                </td>`;
        }

        const row = `
            <tr>
                <td>${p.id_produk}</td>
                <td>${p.nama_produk}</td>
                <td>${p.id_kategori || '-'}</td>
                <td>${harga}</td>
                <td>${p.stok}</td>
                <td>${statusBadge}</td>
                ${isViewer ? "" : actions}
            </tr>`;
        tbody.innerHTML += row;
    });
}

// MODAL FUNCTIONS
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

async function handleFormSubmit(e) {
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
            loadAllProduk();
        } else {
            alert("Gagal menyimpan data");
        }
    } catch (err) {
        console.error(err);
    }
}

async function deleteProduk(id) {
    if (confirm(`Yakin ingin menghapus produk ID ${id}?`)) {
        try {
            const res = await fetch(`http://localhost:5000/api/admin/produk/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                alert("Berhasil dihapus!");
                loadAllProduk();
            } else {
                alert("Gagal menghapus data");
            }
        } catch (err) {
            console.error(err);
        }
    }
}
