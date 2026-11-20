let books = [];
let members = [];
let loans = [];
let currentUser = null;
let currentRole = "member",
  currentView = "dashboard",
  favorites = new Set(),
  activeLoanTab = "borrowed";

const activities = [
  ["▣", "Peminjaman berhasil", "The Psychology of Money berhasil dipinjam.", "2 jam yang lalu"],
  ["♡", "Buku ditambahkan ke favorit", "Atomic Habits ditambahkan ke daftar favorit.", "Kemarin"],
  ["✓", "Pengembalian berhasil", "Deep Work telah selesai dibaca.", "3 hari yang lalu"],
];

const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const bookById = (id) => books.find((b) => b.id === Number(id));

async function api(action, payload = null) {
  const opts = payload
    ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
    : { method: "GET" };
  const res = await fetch(`api/handler.php?action=${action}`, opts);
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json;
}

function cover(b, extra = "") {
  return `<div class="book-cover ${b.color} ${extra}"><span class="cover-title">${b.cover}</span><span class="cover-subtitle">SUKABACA DIGITAL COLLECTION</span></div>`;
}

function toast(message, type = "success") {
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  $("#toastRegion").append(el);
  setTimeout(() => el.remove(), 3200);
}

function showView(view) {
  if (currentRole === "member" && ["managebooks", "members", "alltransactions"].includes(view)) view = "dashboard";
  currentView = view;
  $$(".view").forEach((v) => v.classList.toggle("active", v.id === `view-${view}`));
  $$(".nav-item").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  $("#pageName").textContent = {
    dashboard: "Dashboard",
    catalog: "Katalog e-book",
    mybooks: "Buku saya",
    transactions: "Riwayat transaksi",
    profile: "Profil saya",
    managebooks: "Kelola e-book",
    members: "Data member",
    alltransactions: "Semua transaksi",
  }[view] || "Dashboard";
  $("#sidebar").classList.remove("open");
  if (view === "catalog") renderCatalog();
  if (view === "mybooks") renderLoans();
  if (view === "transactions") renderTransactions();
  if (view === "managebooks") renderAdminBooks();
  if (view === "members") renderMembers();
  if (view === "alltransactions") renderAllTransactions();
  if (view === "profile") syncProfile();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderBookCard(b, compact = false) {
  return `<article class="book-card">${cover(b)}<button class="favorite-btn ${favorites.has(b.id) ? "favorited" : ""}" data-favorite="${b.id}" aria-label="Favoritkan buku">${favorites.has(b.id) ? "♥" : "♡"}</button><div class="book-info"><h3 title="${b.title}">${b.title}</h3><p>${b.author}</p><div class="book-meta"><span class="category-tag">${b.category}</span><span class="rating">★ ${b.rating}</span></div><div class="book-actions"><button class="small-action primary" data-book-detail="${b.id}">Detail buku</button>${compact ? "" : `<button class="small-action" data-borrow="${b.id}">Pinjam</button>`}</div></div></article>`;
}

function renderRecommended() {
  $("#recommendedBooks").innerHTML = books.slice(0, 3).map((b) => renderBookCard(b, true)).join("");
}

function renderActivity() {
  $("#activityList").innerHTML = activities.map((a) => `<div class="activity-item"><div class="activity-icon">${a[0]}</div><div><strong>${a[1]}</strong><p>${a[2]}</p><small>${a[3]}</small></div></div>`).join("");
}

function renderCatalog() {
  const q = $("#searchInput").value.toLowerCase(),
    cat = $("#categoryFilter").value,
    sort = $("#sortFilter").value;
  let list = books.filter((b) => (cat === "all" || b.category === cat) && `${b.title} ${b.author} ${b.category}`.toLowerCase().includes(q));
  if (sort === "title") list.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "newest") list.sort((a, b) => b.year - a.year);
  if (sort === "popular") list.sort((a, b) => b.popularity - a.popularity);
  $("#catalogCount").textContent = list.length;
  $("#resultText").textContent = `Menampilkan ${list.length} dari ${books.length} koleksi`;
  $("#catalogBooks").innerHTML = list.map((b) => renderBookCard(b)).join("");
  $("#emptyState").classList.toggle("hidden", list.length > 0);
}

function openBook(id) {
  const b = bookById(id);
  if (!b) return;
  openModal(`<p class="eyebrow">DETAIL KOLEKSI</p><h2 id="modalTitle">${b.title}</h2><div class="modal-book">${cover(b)}<div><h3>${b.title}</h3><p>oleh ${b.author}</p><div class="book-meta"><span class="category-tag">${b.category}</span><span class="rating">★ ${b.rating}</span></div><p class="modal-desc">${b.description}</p><p><strong>${b.stock}</strong> salinan tersedia</p></div></div><div class="modal-actions"><button class="secondary-button" data-modal-close>Tutup</button><button class="primary-button" data-borrow="${b.id}">Pinjam e-book</button></div>`);
}

async function borrowBook(id) {
  const b = bookById(id);
  if (!b) return;
  try {
    const res = await api("borrow", { bookId: b.id });
    b.stock--;
    loans.unshift(res.data);
    closeModal();
    toast(`"${b.title}" berhasil masuk ke daftar pinjaman.`);
    renderCatalog();
    renderLoans();
    renderTransactions();
    activities.unshift(["▣", "Peminjaman berhasil", `${b.title} berhasil dipinjam.`, "Baru saja"]);
    renderActivity();
  } catch (err) {
    toast(err.message, "error");
  }
}

async function toggleFavorite(id) {
  id = Number(id);
  try {
    const res = await api("favorite", { bookId: id });
    favorites = new Set(res.data);
    renderCatalog();
    renderRecommended();
    toast(favorites.has(id) ? "Ditambahkan ke favorit." : "Dihapus dari favorit.");
  } catch (err) {
    toast(err.message, "error");
  }
}

function renderLoans() {
  const list = loans.filter((l) => (activeLoanTab === "borrowed" ? l.status === "Berlangsung" : l.status === "Selesai"));
  $("#loanList").innerHTML = list.map((l) => {
    const b = bookById(l.bookId);
    if (!b) return "";
    return `<article class="loan-item"><div class="loan-cover ${b.color}">${b.cover}</div><div class="loan-details"><h3>${b.title}</h3><p>${b.author} · Dipinjam ${l.date}</p><div class="progress-track"><div class="progress-fill" style="width:${l.progress}%"></div></div></div><div class="loan-deadline"><strong>${activeLoanTab === "borrowed" ? "Batas akses: " + l.due : "Selesai dibaca"}</strong><small>${activeLoanTab === "borrowed" ? "Akses digital aktif" : "Transaksi " + l.id}</small></div><span class="status ${l.status === "Selesai" ? "status-green" : "status-yellow"}">${l.status}</span></article>`;
  }).join("") || `<div class="empty-state"><div>▣</div><h3>Belum ada buku</h3><p>Jelajahi katalog dan temukan bacaan pertamamu.</p><button class="primary-button" data-go="catalog">Jelajahi katalog</button></div>`;
  $$("[data-tab]").forEach((x) => x.classList.toggle("active", x.dataset.tab === activeLoanTab));
}

function renderTransactions() {
  const q = ($("#transactionSearch")?.value || "").toLowerCase(),
    st = $("#transactionStatus")?.value || "all";
  const rows = loans.filter((l) => {
    const b = bookById(l.bookId);
    return b && b.title.toLowerCase().includes(q) && (st === "all" || l.status === st);
  });
  $("#transactionRows").innerHTML = rows.map((l) => {
    const b = bookById(l.bookId);
    return `<tr><td><strong>${l.id}</strong></td><td><div class="book-cell"><span class="mini-cover ${b.color}">▤</span><strong>${b.title}</strong></div></td><td>${l.date}</td><td>${l.due}</td><td><span class="status ${l.status === "Selesai" ? "status-green" : "status-yellow"}">${l.status}</span></td></tr>`;
  }).join("");
}

function renderAdminBooks() {
  const q = ($("#adminBookSearch")?.value || "").toLowerCase(),
    cat = $("#adminCategory")?.value || "all";
  $("#adminBookRows").innerHTML = books.filter((b) => (cat === "all" || b.category === cat) && `${b.title} ${b.author}`.toLowerCase().includes(q)).map((b) => `<tr><td><div class="book-cell"><span class="mini-cover ${b.color}">▤</span><strong>${b.title}</strong></div></td><td>${b.category}</td><td>${b.author}</td><td>${b.stock}</td><td><span class="status ${b.stock ? "status-green" : "status-yellow"}">${b.stock ? "Tersedia" : "Habis"}</span></td><td><button class="table-action" data-edit-book="${b.id}">Edit</button></td></tr>`).join("");
}

function renderMembers() {
  const q = ($("#memberSearch")?.value || "").toLowerCase();
  $("#memberRows").innerHTML = members.filter((m) => m.join(" ").toLowerCase().includes(q)).map((m) => `<tr><td><strong>${m[0]}</strong></td><td>${m[1]}</td><td>${m[2]}</td><td>${m[3]} buku</td><td><span class="status ${m[4] === "Aktif" ? "status-green" : "status-gray"}">${m[4]}</span></td></tr>`).join("");
}

function renderAllTransactions() {
  const q = ($("#adminTransactionSearch")?.value || "").toLowerCase(),
    st = $("#adminTransactionStatus")?.value || "all";
  $("#allTransactionRows").innerHTML = loans.filter((l) => {
    const b = bookById(l.bookId);
    return b && `${l.id} ${b.title} Akbar, Rifqi, Niam`.toLowerCase().includes(q) && (st === "all" || l.status === st);
  }).map((l) => {
    const b = bookById(l.bookId);
    return `<tr><td><strong>${l.id}</strong></td><td>Akbar, Rifqi, Niams</td><td>${b.title}</td><td>${l.date}</td><td><span class="status ${l.status === "Selesai" ? "status-green" : "status-yellow"}">${l.status}</span></td><td><button class="table-action" data-complete="${l.id}">${l.status === "Selesai" ? "Detail" : "Tandai selesai"}</button></td></tr>`;
  }).join("");
}

function openModal(html) {
  $("#modalContent").innerHTML = html;
  $("#modalBackdrop").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  $("#modalBackdrop").classList.add("hidden");
  document.body.style.overflow = "";
}

function syncProfile() {
  const name = $("#profileNameInput").value || "Akbar, Rifqi, Niam",
    email = $("#profileEmailInput").value || "AkbarRifqiNiam@gmail.com";
  $("#profileDisplayName").textContent = name;
  $("#profileEmail").textContent = email;
  $("#profileAvatar").textContent = name.charAt(0).toUpperCase();
}

function setRole(role) {
  currentRole = role;
  document.body.classList.toggle("is-admin", role === "admin");
  const admin = role === "admin",
    name = currentUser?.name || (admin ? "Admin SukaBaca" : "Member SukaBaca");
  $("#sideName").textContent = name;
  $("#topName").textContent = name;
  $("#sideRole").textContent = admin ? "Administrator" : "Member";
  $("#sideAvatar").textContent = admin ? "L" : "A";
  $("#topAvatar").textContent = admin ? "L" : "A";
  $("#welcomeTitle").innerHTML = admin ? "Selamat bekerja, Admin! <span>✦</span>" : `Selamat datang, ${name}! <span>✦</span>`;
  $("#welcomeSub").textContent = admin ? "Pantau aktivitas dan kelola perpustakaan digital SukaBaca." : "Temukan bacaan baru dan lanjutkan perjalanan belajarmu.";
  $("#featuredTitle").textContent = admin ? "Koleksi terbaru" : "Rekomendasi untukmu";
  $("#profileRole").textContent = admin ? "ADMINISTRATOR" : "MEMBER";
  if (currentUser) {
    $("#profileNameInput").value = currentUser.name;
    $("#profileEmailInput").value = currentUser.email;
    syncProfile();
  }
  if (admin && ["mybooks", "transactions", "profile"].includes(currentView)) showView("dashboard");
  if (!admin && ["managebooks", "members", "alltransactions"].includes(currentView)) showView("dashboard");
  renderRecommended();
}

function syncDashboardDate() {
  const d = new Date();
  $("#welcomeDate").textContent = d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).toUpperCase();
}

function exportCSV(rows, name) {
  const csv = rows.map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
  toast("File laporan berhasil disiapkan.");
}

function openAddBook() {
  openModal(`<p class="eyebrow">MANAJEMEN KOLEKSI</p><h2 id="modalTitle">Tambah e-book baru</h2><p>Lengkapi informasi buku untuk menambahkannya ke katalog.</p><form class="modal-form" id="addBookForm"><label>Judul e-book<input name="title" required placeholder="Contoh: Introduction to Algorithms"></label><label>Nama penulis<input name="author" required placeholder="Nama penulis"></label><label>Kategori<select name="category"><option>Teknologi</option><option>Bisnis</option><option>Desain</option><option>Pengembangan Diri</option><option>Fiksi</option></select></label><label>Jumlah stok<input name="stock" type="number" min="0" value="5" required></label><div class="modal-actions"><button type="button" class="secondary-button" data-modal-close>Batal</button><button class="primary-button">Simpan e-book</button></div></form>`);
}

document.addEventListener("click", async (e) => {
  const t = e.target.closest("button");
  if (!t) return;
  if (t.dataset.view) showView(t.dataset.view);
  if (t.dataset.go) showView(t.dataset.go);
  if (t.dataset.bookDetail) openBook(t.dataset.bookDetail);
  if (t.dataset.borrow) borrowBook(t.dataset.borrow);
  if (t.dataset.favorite) toggleFavorite(t.dataset.favorite);
  if (t.dataset.modalClose !== undefined) closeModal();
  if (t.dataset.editBook) {
    const b = bookById(t.dataset.editBook);
    openModal(`<p class="eyebrow">MANAJEMEN KOLEKSI</p><h2 id="modalTitle">Edit e-book</h2><form class="modal-form" id="editBookForm" data-id="${b.id}"><label>Judul e-book<input name="title" value="${b.title}" required></label><label>Nama penulis<input name="author" value="${b.author}" required></label><label>Kategori<select name="category">${["Teknologi", "Bisnis", "Desain", "Pengembangan Diri", "Fiksi"].map((c) => `<option ${b.category === c ? "selected" : ""}>${c}</option>`).join("")}</select></label><label>Jumlah stok<input name="stock" type="number" min="0" value="${b.stock}" required></label><div class="modal-actions"><button type="button" class="secondary-button" data-modal-close>Batal</button><button class="primary-button">Simpan perubahan</button></div></form>`);
  }
  if (t.dataset.complete) {
    const l = loans.find((x) => x.id === t.dataset.complete);
    if (l && l.status !== "Selesai") {
      try {
        await api("complete_loan", { id: l.id });
        l.status = "Selesai";
        const b = bookById(l.bookId);
        if (b) b.stock++;
        renderAllTransactions();
        renderAdminBooks();
        toast("Transaksi ditandai selesai.");
      } catch (err) {
        toast(err.message, "error");
      }
    }
  }
  if (t.dataset.tab) {
    activeLoanTab = t.dataset.tab;
    renderLoans();
  }
  if (t.dataset.layout) {
    $$("[data-layout]").forEach((x) => x.classList.toggle("selected", x === t));
    $("#catalogBooks").classList.toggle("list-layout", t.dataset.layout === "list");
  }
});

document.addEventListener("submit", async (e) => {
  if (e.target.id === "addBookForm") {
    e.preventDefault();
    const d = new FormData(e.target);
    try {
      const res = await api("add_book", {
        title: d.get("title").trim(),
        author: d.get("author").trim(),
        category: d.get("category"),
        stock: Number(d.get("stock")),
      });
      books.push(res.data);
      closeModal();
      renderAdminBooks();
      renderCatalog();
      toast("E-book berhasil ditambahkan.");
    } catch (err) {
      toast(err.message, "error");
    }
  }
  if (e.target.id === "editBookForm") {
    e.preventDefault();
    const b = bookById(e.target.dataset.id),
      d = new FormData(e.target);
    try {
      const res = await api("edit_book", {
        id: b.id,
        title: d.get("title"),
        author: d.get("author"),
        category: d.get("category"),
        stock: Number(d.get("stock")),
      });
      Object.assign(b, res.data);
      closeModal();
      renderAdminBooks();
      renderCatalog();
      toast("Informasi e-book berhasil diperbarui.");
    } catch (err) {
      toast(err.message, "error");
    }
  }
});

$("#roleSelect").addEventListener("change", async (e) => {
  try {
    const switched = await api("switch_role", { role: e.target.value });
    currentUser = switched.data.user;
    const refreshed = await api("init");
    books = refreshed.data.books;
    loans = refreshed.data.loans;
    members = refreshed.data.members;
    favorites = new Set(refreshed.data.favorites);
    setRole(refreshed.data.role);
    renderCatalog(); renderLoans(); renderTransactions(); renderAdminBooks(); renderMembers(); renderAllTransactions();
    showView("dashboard");
    toast(`Mode ${e.target.value === "admin" ? "Admin" : "Member"} aktif.`);
  } catch (err) {
    toast(err.message, "error");
  }
});

$("#mobileMenu").addEventListener("click", () => $("#sidebar").classList.toggle("open"));
$("#modalClose").addEventListener("click", closeModal);
$("#modalBackdrop").addEventListener("click", (e) => { if (e.target.id === "modalBackdrop") closeModal(); });
$("#searchInput").addEventListener("input", renderCatalog);
$("#categoryFilter").addEventListener("change", renderCatalog);
$("#sortFilter").addEventListener("change", renderCatalog);
$("#resetFilters").addEventListener("click", () => {
  $("#searchInput").value = "";
  $("#categoryFilter").value = "all";
  $("#sortFilter").value = "popular";
  renderCatalog();
});
$("#transactionSearch").addEventListener("input", renderTransactions);
$("#transactionStatus").addEventListener("change", renderTransactions);
$("#adminBookSearch").addEventListener("input", renderAdminBooks);
$("#adminCategory").addEventListener("change", renderAdminBooks);
$("#memberSearch").addEventListener("input", renderMembers);
$("#adminTransactionSearch").addEventListener("input", renderAllTransactions);
$("#adminTransactionStatus").addEventListener("change", renderAllTransactions);
$("#addBookBtn").addEventListener("click", openAddBook);

$("#profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = $("#profileNameInput").value.trim(),
    email = $("#profileEmailInput").value.trim();
  if (name.length < 3) {
    toast("Nama minimal 3 karakter.", "error");
    return;
  }
  try {
    await api("update_profile", { name, email });
    $("#sideName").textContent = name;
    $("#topName").textContent = name;
    syncProfile();
    toast("Profil berhasil diperbarui.");
  } catch (err) {
    toast(err.message, "error");
  }
});

$("#exportMember").addEventListener("click", () => exportCSV([["ID Transaksi", "Judul", "Tanggal Pinjam", "Batas Akses", "Status"], ...loans.map((l) => [l.id, bookById(l.bookId).title, l.date, l.due, l.status])], "riwayat-peminjaman.csv"));
$("#exportAll").addEventListener("click", () => exportCSV([["ID", "Member", "E-book", "Tanggal", "Status"], ...loans.map((l) => [l.id, "Akbar, Rifqi, Niam", bookById(l.bookId).title, l.date, l.status])], "semua-transaksi.csv"));
$("#exportMembers").addEventListener("click", () => exportCSV([["Nama", "Email", "Bergabung", "Peminjaman", "Status"], ...members], "data-member.csv"));
$("#notificationBtn").addEventListener("click", () => toast("Tidak ada notifikasi baru."));
$("#helpBtn").addEventListener("click", () => openModal(`<p class="eyebrow">PUSAT BANTUAN</p><h2 id="modalTitle">Ada yang bisa kami bantu?</h2><p>Di SukaBaca, kamu dapat mencari e-book melalui katalog, membuka detail buku, lalu memilih tombol pinjam. Buku yang dipinjam akan muncul di menu Buku saya.</p><div class="modal-actions"><button class="primary-button" data-modal-close>Mengerti</button></div>`));

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    showView("catalog");
    $("#searchInput").focus();
  }
});

(async function init() {
  syncDashboardDate();
  try {
    const res = await api("init");
    currentUser = res.data.user;
    books = res.data.books;
    loans = res.data.loans;
    members = res.data.members;
    favorites = new Set(res.data.favorites);
    $("#roleSelect").value = res.data.role;
    setRole(res.data.role);
  } catch (err) {
    toast(err.message, "error");
  }
  renderRecommended();
  renderActivity();
  renderCatalog();
  renderLoans();
  renderTransactions();
  renderAdminBooks();
  renderMembers();
  renderAllTransactions();
})();