const books = [
  {
    id: 1,
    title: "The Psychology of Money",
    author: "Morgan Housel",
    category: "Bisnis",
    rating: 4.9,
    color: "cover-orange",
    cover: "THE PSYCHOLOGY OF MONEY",
    stock: 12,
    popularity: 98,
    year: 2024,
    description:
      "Pelajaran abadi tentang kekayaan, keserakahan, dan kebahagiaan. Buku ini membahas bagaimana perilaku memengaruhi keputusan finansial.",
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    category: "Pengembangan Diri",
    rating: 4.8,
    color: "cover-green",
    cover: "ATOMIC HABITS",
    stock: 8,
    popularity: 96,
    year: 2023,
    description:
      "Panduan praktis membangun kebiasaan baik dan menghilangkan kebiasaan buruk melalui perubahan kecil yang konsisten.",
  },
  {
    id: 3,
    title: "The Design of Everyday Things",
    author: "Don Norman",
    category: "Desain",
    rating: 4.7,
    color: "cover-blue",
    cover: "THE DESIGN OF EVERYDAY THINGS",
    stock: 5,
    popularity: 91,
    year: 2025,
    description:
      "Mengenal prinsip desain yang berpusat pada manusia dan bagaimana desain memengaruhi interaksi sehari-hari.",
  },
  {
    id: 4,
    title: "Clean Code",
    author: "Robert C. Martin",
    category: "Teknologi",
    rating: 4.9,
    color: "cover-dark",
    cover: "CLEAN CODE",
    stock: 9,
    popularity: 94,
    year: 2024,
    description:
      "Prinsip dan praktik menulis kode yang bersih, mudah dipahami, serta mudah dipelihara.",
  },
  {
    id: 5,
    title: "Deep Work",
    author: "Cal Newport",
    category: "Pengembangan Diri",
    rating: 4.6,
    color: "cover-purple",
    cover: "DEEP WORK",
    stock: 6,
    popularity: 88,
    year: 2022,
    description:
      "Strategi untuk meningkatkan fokus dan menghasilkan pekerjaan berkualitas di tengah banyaknya distraksi.",
  },
  {
    id: 6,
    title: "The Pragmatic Programmer",
    author: "David Thomas",
    category: "Teknologi",
    rating: 4.8,
    color: "cover-teal",
    cover: "THE PRAGMATIC PROGRAMMER",
    stock: 4,
    popularity: 90,
    year: 2025,
    description:
      "Kumpulan prinsip dan teknik yang membantu programmer bekerja secara efektif dan adaptif.",
  },
  {
    id: 7,
    title: "Steal Like an Artist",
    author: "Austin Kleon",
    category: "Desain",
    rating: 4.5,
    color: "cover-yellow",
    cover: "STEAL LIKE AN ARTIST",
    stock: 11,
    popularity: 84,
    year: 2023,
    description:
      "Cara kreatif menemukan inspirasi, mengembangkan ide, dan membangun proses berkarya.",
  },
  {
    id: 8,
    title: "The Midnight Library",
    author: "Matt Haig",
    category: "Fiksi",
    rating: 4.7,
    color: "cover-pink",
    cover: "THE MIDNIGHT LIBRARY",
    stock: 7,
    popularity: 87,
    year: 2025,
    description:
      "Novel tentang pilihan hidup, kesempatan kedua, dan berbagai kemungkinan dari keputusan yang pernah diambil.",
  },
];
let currentRole = "member",
  currentView = "dashboard",
  favorites = new Set([2, 5, 7]),
  activeLoanTab = "borrowed";
let loans = [
  {
    id: "TRX-2026-0048",
    bookId: 1,
    date: "12 Nov 2026",
    due: "26 Nov 2026",
    status: "Berlangsung",
    progress: 65,
  },
  {
    id: "TRX-2026-0045",
    bookId: 4,
    date: "08 Nov 2026",
    due: "22 Nov 2026",
    status: "Berlangsung",
    progress: 82,
  },
  {
    id: "TRX-2026-0041",
    bookId: 2,
    date: "02 Nov 2026",
    due: "16 Nov 2026",
    status: "Berlangsung",
    progress: 100,
  },
  {
    id: "TRX-2026-0032",
    bookId: 5,
    date: "20 Okt 2026",
    due: "03 Nov 2026",
    status: "Selesai",
    progress: 100,
  },
  {
    id: "TRX-2026-0028",
    bookId: 7,
    date: "14 Okt 2026",
    due: "28 Okt 2026",
    status: "Selesai",
    progress: 100,
  },
];
const members = [
  ["Nadia Safitri", "nadia@email.com", "12 Sep 2025", "8", "Aktif"],
  ["Rizky Ramadhan", "rizky@email.com", "18 Okt 2025", "5", "Aktif"],
  ["Akbar And Friends", "Akbar.bar@email.com", "02 Sep 2025", "12", "Aktif"],
  ["Dimas Pratama", "dimas@email.com", "21 Jan 2026", "3", "Aktif"],
  ["Salsa Maharani", "salsa@email.com", "03 Mar 2026", "0", "Nonaktif"],
];
const activities = [
  [
    "▣",
    "Peminjaman berhasil",
    "The Psychology of Money berhasil dipinjam.",
    "2 jam yang lalu",
  ],
  [
    "♡",
    "Buku ditambahkan ke favorit",
    "Atomic Habits ditambahkan ke daftar favorit.",
    "Kemarin",
  ],
  [
    "✓",
    "Pengembalian berhasil",
    "Deep Work telah selesai dibaca.",
    "3 hari yang lalu",
  ],
];
const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const bookById = (id) => books.find((b) => b.id === Number(id));
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
  if (
    currentRole === "member" &&
    ["managebooks", "members", "alltransactions"].includes(view)
  )
    view = "dashboard";
  currentView = view;
  $$(".view").forEach((v) =>
    v.classList.toggle("active", v.id === `view-${view}`),
  );
  $$(".nav-item").forEach((b) =>
    b.classList.toggle("active", b.dataset.view === view),
  );
  $("#pageName").textContent =
    {
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
  $("#recommendedBooks").innerHTML = books
    .slice(0, 3)
    .map((b) => renderBookCard(b, true))
    .join("");
}
function renderActivity() {
  $("#activityList").innerHTML = activities
    .map(
      (a) =>
        `<div class="activity-item"><div class="activity-icon">${a[0]}</div><div><strong>${a[1]}</strong><p>${a[2]}</p><small>${a[3]}</small></div></div>`,
    )
    .join("");
}
function renderCatalog() {
  const q = $("#searchInput").value.toLowerCase(),
    cat = $("#categoryFilter").value,
    sort = $("#sortFilter").value;
  let list = books.filter(
    (b) =>
      (cat === "all" || b.category === cat) &&
      `${b.title} ${b.author} ${b.category}`.toLowerCase().includes(q),
  );
  if (sort === "title") list.sort((a, b) => a.title.localeCompare(b.title));
  if (sort === "newest") list.sort((a, b) => b.year - a.year);
  if (sort === "popular") list.sort((a, b) => b.popularity - a.popularity);
  $("#catalogCount").textContent = list.length;
  $("#resultText").textContent =
    `Menampilkan ${list.length} dari ${books.length} koleksi`;
  $("#catalogBooks").innerHTML = list.map((b) => renderBookCard(b)).join("");
  $("#emptyState").classList.toggle("hidden", list.length > 0);
}
function openBook(id) {
  const b = bookById(id);
  if (!b) return;
  openModal(
    `<p class="eyebrow">DETAIL KOLEKSI</p><h2 id="modalTitle">${b.title}</h2><div class="modal-book">${cover(b)}<div><h3>${b.title}</h3><p>oleh ${b.author}</p><div class="book-meta"><span class="category-tag">${b.category}</span><span class="rating">★ ${b.rating}</span></div><p class="modal-desc">${b.description}</p><p><strong>${b.stock}</strong> salinan tersedia</p></div></div><div class="modal-actions"><button class="secondary-button" data-modal-close>Tutup</button><button class="primary-button" data-borrow="${b.id}">Pinjam e-book</button></div>`,
  );
}
function borrowBook(id) {
  const b = bookById(id);
  if (!b) return;
  if (b.stock < 1) {
    toast("Maaf, buku sedang tidak tersedia.", "error");
    return;
  }
  if (loans.some((l) => l.bookId === b.id && l.status === "Berlangsung")) {
    toast("Kamu masih memiliki peminjaman aktif untuk buku ini.", "error");
    return;
  }
  b.stock--;
  const n = loans.length + 1;
  loans.unshift({
    id: `TRX-2026-${String(50 + n).padStart(4, "0")}`,
    bookId: b.id,
    date: "19 Nov 2026",
    due: "03 Des 2026",
    status: "Berlangsung",
    progress: 0,
  });
  closeModal();
  toast(`"${b.title}" berhasil masuk ke daftar pinjaman.`);
  renderCatalog();
  renderLoans();
  renderTransactions();
  activities.unshift([
    "▣",
    "Peminjaman berhasil",
    `${b.title} berhasil dipinjam.`,
    "Baru saja",
  ]);
  renderActivity();
}
function toggleFavorite(id) {
  id = Number(id);
  favorites.has(id) ? favorites.delete(id) : favorites.add(id);
  renderCatalog();
  renderRecommended();
  toast(
    favorites.has(id) ? "Ditambahkan ke favorit." : "Dihapus dari favorit.",
  );
}
function renderLoans() {
  const list = loans.filter((l) =>
    activeLoanTab === "borrowed"
      ? l.status === "Berlangsung"
      : l.status === "Selesai",
  );
  $("#loanList").innerHTML =
    list
      .map((l) => {
        const b = bookById(l.bookId);
        return `<article class="loan-item"><div class="loan-cover ${b.color}">${b.cover}</div><div class="loan-details"><h3>${b.title}</h3><p>${b.author} · Dipinjam ${l.date}</p><div class="progress-track"><div class="progress-fill" style="width:${l.progress}%"></div></div></div><div class="loan-deadline"><strong>${activeLoanTab === "borrowed" ? "Batas akses: " + l.due : "Selesai dibaca"}</strong><small>${activeLoanTab === "borrowed" ? "Akses digital aktif" : "Transaksi " + l.id}</small></div><span class="status ${l.status === "Selesai" ? "status-green" : "status-yellow"}">${l.status}</span></article>`;
      })
      .join("") ||
    `<div class="empty-state"><div>▣</div><h3>Belum ada buku</h3><p>Jelajahi katalog dan temukan bacaan pertamamu.</p><button class="primary-button" data-go="catalog">Jelajahi katalog</button></div>`;
  $$("[data-tab]").forEach((x) =>
    x.classList.toggle("active", x.dataset.tab === activeLoanTab),
  );
}
function renderTransactions() {
  const q = ($("#transactionSearch")?.value || "").toLowerCase(),
    st = $("#transactionStatus")?.value || "all";
  const rows = loans.filter((l) => {
    const b = bookById(l.bookId);
    return (
      b.title.toLowerCase().includes(q) && (st === "all" || l.status === st)
    );
  });
  $("#transactionRows").innerHTML = rows
    .map((l) => {
      const b = bookById(l.bookId);
      return `<tr><td><strong>${l.id}</strong></td><td><div class="book-cell"><span class="mini-cover ${b.color}">▤</span><strong>${b.title}</strong></div></td><td>${l.date}</td><td>${l.due}</td><td><span class="status ${l.status === "Selesai" ? "status-green" : "status-yellow"}">${l.status}</span></td></tr>`;
    })
    .join("");
}
function renderAdminBooks() {
  const q = ($("#adminBookSearch")?.value || "").toLowerCase(),
    cat = $("#adminCategory")?.value || "all";
  $("#adminBookRows").innerHTML = books
    .filter(
      (b) =>
        (cat === "all" || b.category === cat) &&
        `${b.title} ${b.author}`.toLowerCase().includes(q),
    )
    .map(
      (b) =>
        `<tr><td><div class="book-cell"><span class="mini-cover ${b.color}">▤</span><strong>${b.title}</strong></div></td><td>${b.category}</td><td>${b.author}</td><td>${b.stock}</td><td><span class="status ${b.stock ? "status-green" : "status-yellow"}">${b.stock ? "Tersedia" : "Habis"}</span></td><td><button class="table-action" data-edit-book="${b.id}">Edit</button></td></tr>`,
    )
    .join("");
}
function renderMembers() {
  const q = ($("#memberSearch")?.value || "").toLowerCase();
  $("#memberRows").innerHTML = members
    .filter((m) => m.join(" ").toLowerCase().includes(q))
    .map(
      (m) =>
        `<tr><td><strong>${m[0]}</strong></td><td>${m[1]}</td><td>${m[2]}</td><td>${m[3]} buku</td><td><span class="status ${m[4] === "Aktif" ? "status-green" : "status-gray"}">${m[4]}</span></td></tr>`,
    )
    .join("");
}
function renderAllTransactions() {
  const q = ($("#adminTransactionSearch")?.value || "").toLowerCase(),
    st = $("#adminTransactionStatus")?.value || "all";
  $("#allTransactionRows").innerHTML = loans
    .filter((l) => {
      const b = bookById(l.bookId);
      return (
        `${l.id} ${b.title} Akbar And Friends`.toLowerCase().includes(q) &&
        (st === "all" || l.status === st)
      );
    })
    .map((l) => {
      const b = bookById(l.bookId);
      return `<tr><td><strong>${l.id}</strong></td><td>Akbar And Friends</td><td>${b.title}</td><td>${l.date}</td><td><span class="status ${l.status === "Selesai" ? "status-green" : "status-yellow"}">${l.status}</span></td><td><button class="table-action" data-complete="${l.id}">${l.status === "Selesai" ? "Detail" : "Tandai selesai"}</button></td></tr>`;
    })
    .join("");
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
  const name = $("#profileNameInput").value || "Akbar And Friends",
    email = $("#profileEmailInput").value || "Akbar.bar@email.com";
  $("#profileDisplayName").textContent = name;
  $("#profileEmail").textContent = email;
  $("#profileAvatar").textContent = name.charAt(0).toUpperCase();
}
function setRole(role) {
  currentRole = role;
  document.body.classList.toggle("is-admin", role === "admin");
  const admin = role === "admin",
    name = admin ? "Admin SukaBaca" : "Akbar And Friends";
  $("#sideName").textContent = name;
  $("#topName").textContent = name;
  $("#sideRole").textContent = admin ? "Administrator" : "Member";
  $("#sideAvatar").textContent = admin ? "L" : "A";
  $("#topAvatar").textContent = admin ? "L" : "A";
  $("#welcomeTitle").innerHTML = admin
    ? "Selamat bekerja, Admin! <span>✦</span>"
    : "Selamat datang, Akbar! <span>✦</span>";
  $("#welcomeSub").textContent = admin
    ? "Pantau aktivitas dan kelola perpustakaan digital SukaBaca."
    : "Temukan bacaan baru dan lanjutkan perjalanan belajarmu.";
  $("#featuredTitle").textContent = admin
    ? "Koleksi terbaru"
    : "Rekomendasi untukmu";
  $("#profileRole").textContent = admin ? "ADMINISTRATOR" : "MEMBER";
  if (admin && ["mybooks", "transactions", "profile"].includes(currentView))
    showView("dashboard");
  if (
    !admin &&
    ["managebooks", "members", "alltransactions"].includes(currentView)
  )
    showView("dashboard");
  renderRecommended();
}
function syncDashboardDate() {
  const d = new Date();
  $("#welcomeDate").textContent = d
    .toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();
}
function exportCSV(rows, name) {
  const csv = rows
    .map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
    .join("\n");
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
  openModal(
    `<p class="eyebrow">MANAJEMEN KOLEKSI</p><h2 id="modalTitle">Tambah e-book baru</h2><p>Lengkapi informasi buku untuk menambahkannya ke katalog.</p><form class="modal-form" id="addBookForm"><label>Judul e-book<input name="title" required placeholder="Contoh: Introduction to Algorithms"></label><label>Nama penulis<input name="author" required placeholder="Nama penulis"></label><label>Kategori<select name="category"><option>Teknologi</option><option>Bisnis</option><option>Desain</option><option>Pengembangan Diri</option><option>Fiksi</option></select></label><label>Jumlah stok<input name="stock" type="number" min="0" value="5" required></label><div class="modal-actions"><button type="button" class="secondary-button" data-modal-close>Batal</button><button class="primary-button">Simpan e-book</button></div></form>`,
  );
}
document.addEventListener("click", (e) => {
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
    openModal(
      `<p class="eyebrow">MANAJEMEN KOLEKSI</p><h2 id="modalTitle">Edit e-book</h2><form class="modal-form" id="editBookForm" data-id="${b.id}"><label>Judul e-book<input name="title" value="${b.title}" required></label><label>Nama penulis<input name="author" value="${b.author}" required></label><label>Kategori<select name="category">${["Teknologi", "Bisnis", "Desain", "Pengembangan Diri", "Fiksi"].map((c) => `<option ${b.category === c ? "selected" : ""}>${c}</option>`).join("")}</select></label><label>Jumlah stok<input name="stock" type="number" min="0" value="${b.stock}" required></label><div class="modal-actions"><button type="button" class="secondary-button" data-modal-close>Batal</button><button class="primary-button">Simpan perubahan</button></div></form>`,
    );
  }
  if (t.dataset.complete) {
    const l = loans.find((x) => x.id === t.dataset.complete);
    if (l && l.status !== "Selesai") {
      l.status = "Selesai";
      renderAllTransactions();
      toast("Transaksi ditandai selesai.");
    }
  }
  if (t.dataset.tab) {
    activeLoanTab = t.dataset.tab;
    renderLoans();
  }
  if (t.dataset.layout) {
    $$("[data-layout]").forEach((x) => x.classList.toggle("selected", x === t));
    $("#catalogBooks").classList.toggle(
      "list-layout",
      t.dataset.layout === "list",
    );
  }
});
document.addEventListener("submit", (e) => {
  if (e.target.id === "addBookForm") {
    e.preventDefault();
    const d = new FormData(e.target),
      title = d.get("title").trim();
    books.push({
      id: Math.max(...books.map((b) => b.id)) + 1,
      title,
      author: d.get("author"),
      category: d.get("category"),
      rating: 4.5,
      color: "cover-teal",
      cover: title.toUpperCase().slice(0, 25),
      stock: Number(d.get("stock")),
      popularity: 70,
      year: 2026,
      description: "Deskripsi buku belum ditambahkan.",
    });
    closeModal();
    renderAdminBooks();
    renderCatalog();
    toast("E-book berhasil ditambahkan.");
  }
  if (e.target.id === "editBookForm") {
    e.preventDefault();
    const b = bookById(e.target.dataset.id),
      d = new FormData(e.target);
    Object.assign(b, {
      title: d.get("title"),
      author: d.get("author"),
      category: d.get("category"),
      stock: Number(d.get("stock")),
    });
    closeModal();
    renderAdminBooks();
    renderCatalog();
    toast("Informasi e-book berhasil diperbarui.");
  }
});
$("#roleSelect").addEventListener("change", (e) => {
  setRole(e.target.value);
  showView("dashboard");
  toast(`Mode ${e.target.value === "admin" ? "Admin" : "Member"} aktif.`);
});
$("#mobileMenu").addEventListener("click", () =>
  $("#sidebar").classList.toggle("open"),
);
$("#modalClose").addEventListener("click", closeModal);
$("#modalBackdrop").addEventListener("click", (e) => {
  if (e.target.id === "modalBackdrop") closeModal();
});
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
$("#profileForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("#profileNameInput").value.trim();
  if (name.length < 3) {
    toast("Nama minimal 3 karakter.", "error");
    return;
  }
  $("#sideName").textContent = name;
  $("#topName").textContent = name;
  syncProfile();
  toast("Profil berhasil diperbarui.");
});
$("#exportMember").addEventListener("click", () =>
  exportCSV(
    [
      ["ID Transaksi", "Judul", "Tanggal Pinjam", "Batas Akses", "Status"],
      ...loans.map((l) => [
        l.id,
        bookById(l.bookId).title,
        l.date,
        l.due,
        l.status,
      ]),
    ],
    "riwayat-peminjaman.csv",
  ),
);
$("#exportAll").addEventListener("click", () =>
  exportCSV(
    [
      ["ID", "Member", "E-book", "Tanggal", "Status"],
      ...loans.map((l) => [
        l.id,
        "Akbar And Friends",
        bookById(l.bookId).title,
        l.date,
        l.status,
      ]),
    ],
    "semua-transaksi.csv",
  ),
);
$("#exportMembers").addEventListener("click", () =>
  exportCSV(
    [["Nama", "Email", "Bergabung", "Peminjaman", "Status"], ...members],
    "data-member.csv",
  ),
);
$("#notificationBtn").addEventListener("click", () =>
  toast("Tidak ada notifikasi baru."),
);
$("#helpBtn").addEventListener("click", () =>
  openModal(
    `<p class="eyebrow">PUSAT BANTUAN</p><h2 id="modalTitle">Ada yang bisa kami bantu?</h2><p>Di SukaBaca, kamu dapat mencari e-book melalui katalog, membuka detail buku, lalu memilih tombol pinjam. Buku yang dipinjam akan muncul di menu Buku saya.</p><div class="modal-actions"><button class="primary-button" data-modal-close>Mengerti</button></div>`,
  ),
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    showView("catalog");
    $("#searchInput").focus();
  }
});
syncDashboardDate();
renderRecommended();
renderActivity();
renderCatalog();
renderLoans();
renderTransactions();
renderAdminBooks();
renderMembers();
renderAllTransactions();
