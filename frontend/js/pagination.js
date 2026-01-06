// STATE
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

// INITIAL LOAD
document.addEventListener("DOMContentLoaded", () => {
    loadProduk();

    // Event Listeners
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

    // RBAC: Add Button
    if (isAdmin || isEditor) {
        const actionsDiv = document.querySelector(".actions");
        const btnAdd = document.createElement("button");
        btnAdd.innerText = "+ Tambah Produk";
        btnAdd.className = "btn-admin";
        btnAdd.style.background = "#3b82f6";
        btnAdd.style.width = "auto";
        btnAdd.onclick = () => openModal();
        actionsDiv.appendChild(btnAdd);
    }
});

function loadProduk() {
    const { page, limit, search, sort } = state;
    const url = `http://localhost:5000/api/dashboard?page=${page}&limit=${limit}&search=${search}&sort=${sort}`;

    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => res.json())
        .then(data => {
            renderTable(data.data || []);
            const meta = data.meta || data;
            state.totalPages = meta.totalPages || 1;

            document.getElementById("pageInfo").innerText = `Page ${state.page} of ${state.totalPages}`;
            document.getElementById("prev").disabled = state.page <= 1;
            document.getElementById("next").disabled = state.page >= state.totalPages;

            document.getElementById("prev").style.opacity = state.page <= 1 ? "0.5" : "1";
            document.getElementById("next").style.opacity = state.page >= state.totalPages ? "0.5" : "1";
        })
        .catch(err => console.error("Error:", err));
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
                    <button onclick='openModal(${productData})' style="background:#f59e0b; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Edit</button>
                    <button onclick="deleteProduk(${p.id_produk})" style="background:#ef4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">Hapus</button>
                </td>`;
        } else {
            actions = ""; // Viewer has no action cell content
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

// MODAL & CRUD FUNCTIONS
function openModal(product = null) {
    const modal = document.getElementById("productModal");
    modal.style.display = "block";
    if (product) {
        document.getElementById("modalTitle").innerText = "Edit Produk";
        document.getElementById("productId").value = product.id_produk;
        document.getElementById("nama").value = product.nama_produk;
        document.getElementById("kategori").value = product.id_kategori;
        document.getElementById("harga").value = product.harga;
        document.getElementById("stok").value = product.stok;
    } else {
        document.getElementById("modalTitle").innerText = "Tambah Produk";
        document.getElementById("productForm").reset();
        document.getElementById("productId").value = "";
    }
}

function closeModal() {
    document.getElementById("productModal").style.display = "none";
}

document.getElementById("productForm").onsubmit = async (e) => {
    e.preventDefault();
    const id = document.getElementById("productId").value;
    const data = {
        nama: document.getElementById("nama").value,
        kategori: document.getElementById("kategori").value,
        harga: document.getElementById("harga").value,
        stok: document.getElementById("stok").value
    };

    const url = id ? `http://localhost:5000/api/admin/produk/${id}` : `http://localhost:5000/api/admin/produk`;
    const res = await fetch(url, {
        method: id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(data)
    });

    if (res.ok) {
        alert("Berhasil!");
        closeModal();
        loadProduk();
    } else {
        alert("Gagal simpan data");
    }
};

window.deleteProduk = async (id) => {
    if (confirm("Hapus produk ini?")) {
        const res = await fetch(`http://localhost:5000/api/admin/produk/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) { loadProduk(); }
    }
};
