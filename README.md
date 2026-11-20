# SukaBaca — PHP OOP Edition

Aplikasi katalog dan simulasi peminjaman e-book berbasis HTML, CSS, JavaScript, dan PHP 8.x tanpa framework. Data disimpan dalam berkas JSON di folder `data/`.

## Menjalankan dengan XAMPP

1. Pastikan PHP 8.0 atau lebih baru tersedia (XAMPP versi PHP 8.x).
2. Ekstrak folder `SukaBaca-main` ke `C:\xampp\htdocs\SukaBaca`.
3. Jalankan **Apache** dari XAMPP Control Panel.
4. Buka `http://localhost/SukaBaca/` di browser. Jangan membuka `index.html` dengan klik dua kali karena PHP perlu dijalankan melalui server.
5. Gunakan dropdown mode di kanan atas untuk berpindah antara tampilan Member dan Admin (mode demonstrasi tugas).

## Fitur yang terhubung

- Katalog buku berasal dari `data/books.json`, termasuk pencarian, filter, urutkan, dan detail buku.
- Member dapat meminjam buku dan menyimpan favorit.
- Stok berkurang saat peminjaman berhasil.
- Admin dapat menambah/mengubah buku, melihat member dan transaksi, serta menyelesaikan transaksi.
- Stok kembali bertambah saat transaksi diselesaikan.
- Profil pengguna dapat diperbarui.
- Riwayat dan laporan CSV tersedia dari UI.

## Struktur penting

```text
api/handler.php                 Endpoint JSON untuk front-end
config/config.php               Session, path, dan autoload namespace
src/Classes/User.php            Abstract class User
src/Classes/Member.php          Turunan User untuk member
src/Classes/Admin.php           Turunan User untuk admin
src/Classes/Book.php            Model buku dengan validasi stok
src/Classes/Transaction.php     Model transaksi peminjaman
src/Services/LibraryService.php Logika bisnis dan penyimpanan JSON
data/books.json                Katalog buku
data/users.json                Data pengguna
 data/transactions.json         Data transaksi
assets/js/app.js                Interaksi UI dan fetch API
assets/css/style.css            Tampilan asli SukaBaca
index.html                      Antarmuka aplikasi
```

## Endpoint API

Semua endpoint berada di `api/handler.php?action=...` dan mengembalikan JSON dengan bentuk `success`, `message`, dan `data`.

| Action | Metode | Fungsi |
|---|---|---|
| `init` | GET | Memuat user, buku, transaksi, member, dan favorit |
| `switch_role` | POST | Mengganti mode demo Member/Admin |
| `borrow` | POST | Meminjam buku dan mengurangi stok |
| `favorite` | POST | Menambah/menghapus favorit |
| `add_book` | POST | Menambahkan buku (Admin) |
| `edit_book` | POST | Mengubah buku (Admin) |
| `complete_loan` | POST | Menyelesaikan transaksi dan mengembalikan stok (Admin) |
| `update_profile` | POST | Memperbarui profil pengguna aktif |

## Penerapan PHP OOP

- **Class & Object:** `Book`, `Transaction`, `Member`, `Admin`, dan `LibraryService`.
- **Encapsulation:** properti model dibuat `private`/`protected` dan diakses melalui method.
- **Inheritance:** `Member` dan `Admin` mewarisi abstract class `User`.
- **Polymorphism:** `getRole()` dan `getPermissions()` memiliki implementasi berbeda pada `Member` dan `Admin`.
- **Namespace:** class memakai namespace `App\Classes` dan service `App\Services`, dimuat melalui autoloader.

## Catatan penting

Pemilih Member/Admin yang sudah tersedia di UI merupakan **simulasi pergantian role untuk demonstrasi tugas**, bukan sistem autentikasi produksi. Jangan gunakan mekanisme ini untuk aplikasi publik tanpa login, otorisasi server yang sesungguhnya, dan perlindungan CSRF. File JSON harus dapat ditulis oleh proses Apache agar perubahan data tersimpan.
