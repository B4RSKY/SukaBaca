<?php
declare(strict_types=1);

namespace App\Services;

use App\Classes\Admin;
use App\Classes\Book;
use App\Classes\Member;
use App\Classes\Transaction;
use App\Classes\User;
use RuntimeException;
use InvalidArgumentException;

class LibraryService
{
    private string $booksFile;
    private string $usersFile;
    private string $transactionsFile;

    public function __construct()
    {
        $this->booksFile = DATA_PATH . '/books.json';
        $this->usersFile = DATA_PATH . '/users.json';
        $this->transactionsFile = DATA_PATH . '/transactions.json';
        $this->ensureDataFiles();
    }

    private function ensureDataFiles(): void
    {
        foreach ([$this->booksFile, $this->usersFile, $this->transactionsFile] as $file) {
            if (!is_file($file) || trim((string)file_get_contents($file)) === '') {
                file_put_contents($file, "[]", LOCK_EX);
            }
        }
        if ($this->readJson($this->booksFile) === []) $this->writeJson($this->booksFile, $this->defaultBooks());
        if ($this->readJson($this->usersFile) === []) $this->writeJson($this->usersFile, $this->defaultUsers());
        if (!isset($_SESSION['user_id'])) $_SESSION['user_id'] = 1;
        if (!isset($_SESSION['role'])) $_SESSION['role'] = 'member';
    }

    private function defaultBooks(): array
    {
        $rows = [
            [1,'Atomic Habits','James Clear','Pengembangan Diri',4.9,'cover-orange','ATOMIC HABITS',8,98,2018,'Panduan praktis membangun kebiasaan baik dan menghilangkan kebiasaan buruk melalui perubahan kecil yang konsisten.'],
            [2,'The Psychology of Money','Morgan Housel','Bisnis',4.9,'cover-blue','THE PSYCHOLOGY OF MONEY',6,96,2020,'Pelajaran tentang perilaku manusia, keputusan finansial, kekayaan, dan hubungan seseorang dengan uang.'],
            [3,'Deep Work','Cal Newport','Pengembangan Diri',4.8,'cover-purple','DEEP WORK',5,91,2016,'Membahas kemampuan fokus tanpa distraksi untuk menghasilkan pekerjaan yang bernilai tinggi.'],
            [4,'Clean Code','Robert C. Martin','Teknologi',4.8,'cover-teal','CLEAN CODE',4,89,2008,'Prinsip dan praktik menulis kode yang mudah dibaca, dipelihara, dan dikembangkan.'],
            [5,'The Design of Everyday Things','Don Norman','Desain',4.7,'cover-pink','THE DESIGN OF EVERYDAY THINGS',7,85,2013,'Pengenalan prinsip desain yang berpusat pada manusia dan pengalaman pengguna.'],
            [6,'Introduction to Algorithms','Thomas H. Cormen dkk.','Teknologi',4.7,'cover-navy','INTRODUCTION TO ALGORITHMS',3,82,2009,'Referensi komprehensif mengenai algoritma, analisis kompleksitas, dan struktur data.'],
            [7,'Laskar Pelangi','Andrea Hirata','Fiksi',4.8,'cover-yellow','LASKAR PELANGI',9,88,2005,'Kisah perjuangan anak-anak Belitung dalam mengejar pendidikan dan cita-cita.'],
            [8,'Start With Why','Simon Sinek','Bisnis',4.6,'cover-green','START WITH WHY',5,78,2009,'Mengajak pembaca memahami alasan dan tujuan sebagai dasar kepemimpinan dan inovasi.'],
        ];
        return array_map(static fn($r) => ['id'=>$r[0], 'title'=>$r[1], 'author'=>$r[2], 'category'=>$r[3], 'rating'=>$r[4], 'color'=>$r[5], 'cover'=>$r[6], 'stock'=>$r[7], 'popularity'=>$r[8], 'year'=>$r[9], 'description'=>$r[10]], $rows);
    }

    private function defaultUsers(): array
    {
        return [
            ['id'=>1,'name'=>'Akbar, Rifqi, Niam','email'=>'member@sukabaca.test','password'=>password_hash('member123', PASSWORD_DEFAULT),'role'=>'Member','joined_at'=>date('d M Y'),'status'=>'Aktif','favorites'=>[2,5,7]],
            ['id'=>2,'name'=>'Admin SukaBaca','email'=>'admin@sukabaca.test','password'=>password_hash('admin123', PASSWORD_DEFAULT),'role'=>'Admin','joined_at'=>date('d M Y'),'status'=>'Aktif'],
        ];
    }

    private function readJson(string $file): array
    {
        $raw = @file_get_contents($file);
        if ($raw === false || trim($raw) === '') return [];
        $data = json_decode($raw, true);
        if (!is_array($data)) throw new RuntimeException('Data JSON rusak: ' . basename($file));
        return $data;
    }

    private function writeJson(string $file, array $data): void
    {
        $json = json_encode(array_values($data), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($json === false || file_put_contents($file, $json, LOCK_EX) === false) {
            throw new RuntimeException('Gagal menyimpan data ' . basename($file));
        }
    }

    private function hydrateUser(array $row): User
    {
        $args = [(int)$row['id'], (string)$row['name'], (string)$row['email'], (string)($row['password'] ?? ''), (string)($row['joined_at'] ?? ''), (string)($row['status'] ?? 'Aktif')];
        if (strtolower((string)($row['role'] ?? 'member')) === 'admin') return new Admin(...$args);
        return new Member($args[0], $args[1], $args[2], $args[3], $args[4], $args[5], (array)($row['favorites'] ?? []));
    }

    public function getCurrentUser(): User
    {
        $id = (int)($_SESSION['user_id'] ?? 1);
        foreach ($this->readJson($this->usersFile) as $row) if ((int)$row['id'] === $id) return $this->hydrateUser($row);
        $_SESSION['user_id'] = 1;
        return $this->hydrateUser($this->readJson($this->usersFile)[0]);
    }

    public function switchRoleSession(string $role): User
    {
        $role = strtolower(trim($role));
        if (!in_array($role, ['admin', 'member'], true)) throw new InvalidArgumentException('Mode pengguna tidak valid.');
        // Pemilih role pada UI saat ini adalah simulasi demonstrasi, bukan autentikasi produksi.
        $targetId = $role === 'admin' ? 2 : 1;
        foreach ($this->readJson($this->usersFile) as $row) {
            if ((int)$row['id'] === $targetId) {
                $_SESSION['user_id'] = $targetId;
                $_SESSION['role'] = $role;
                return $this->hydrateUser($row);
            }
        }
        throw new RuntimeException('Akun untuk mode tersebut tidak ditemukan.');
    }

    public function getAllBooks(): array
    {
        return array_map(static fn($row) => (new Book($row))->toArray(), $this->readJson($this->booksFile));
    }

    public function getTransactions(): array
    {
        $rows = $this->readJson($this->transactionsFile);
        $user = $this->getCurrentUser();
        if ($user instanceof Member) $rows = array_filter($rows, static fn($r) => (int)($r['member_id'] ?? 1) === $user->getId());
        return array_values(array_map(static fn($row) => (new Transaction($row))->toArray(), $rows));
    }

    public function borrowBook(int $bookId): Transaction
    {
        $user = $this->getCurrentUser();
        if (!$user instanceof Member) throw new RuntimeException('Mode Admin tidak dapat meminjam buku.');
        $books = $this->readJson($this->booksFile);
        $found = false;
        foreach ($books as &$row) {
            if ((int)$row['id'] === $bookId) {
                $book = new Book($row);
                $book->decrementStock();
                $row = $book->toArray();
                $found = true;
                break;
            }
        }
        unset($row);
        if (!$found) throw new RuntimeException('Buku tidak ditemukan.');
        $transactions = $this->readJson($this->transactionsFile);
        foreach ($transactions as $trx) {
            if ((int)($trx['member_id'] ?? 1) === $user->getId() && (int)($trx['bookId'] ?? $trx['book_id'] ?? 0) === $bookId && ($trx['status'] ?? '') === 'Berlangsung') {
                throw new RuntimeException('Buku ini masih dalam daftar pinjamanmu.');
            }
        }
        $this->writeJson($this->booksFile, $books);
        $trx = new Transaction(['id'=>'TRX-' . date('ymd') . '-' . strtoupper(bin2hex(random_bytes(2))), 'member_id'=>$user->getId(), 'bookId'=>$bookId, 'date'=>date('d M Y'), 'due'=>date('d M Y', strtotime('+14 days')), 'status'=>'Berlangsung', 'progress'=>0]);
        $transactions[] = $trx->toArray();
        $this->writeJson($this->transactionsFile, $transactions);
        return $trx;
    }

    public function returnBook(string $id): Transaction
    {
        $this->requireAdmin();
        $transactions = $this->readJson($this->transactionsFile);
        $books = $this->readJson($this->booksFile);
        $updated = null;
        foreach ($transactions as &$row) {
            if ((string)$row['id'] === $id) {
                if (($row['status'] ?? '') === 'Selesai') throw new RuntimeException('Transaksi ini sudah selesai.');
                $trx = new Transaction($row);
                $trx->markAsCompleted();
                $row = $trx->toArray();
                $updated = $trx;
                foreach ($books as &$bookRow) {
                    if ((int)$bookRow['id'] === $trx->getBookId()) {
                        $book = new Book($bookRow); $book->incrementStock(); $bookRow = $book->toArray(); break;
                    }
                }
                unset($bookRow);
                break;
            }
        }
        unset($row);
        if (!$updated) throw new RuntimeException('Transaksi tidak ditemukan.');
        $this->writeJson($this->transactionsFile, $transactions);
        $this->writeJson($this->booksFile, $books);
        return $updated;
    }

    public function createBook(array $data): Book
    {
        $this->requireAdmin();
        $books = $this->readJson($this->booksFile);
        $ids = array_column($books, 'id');
        $book = new Book($data + ['id'=>(empty($ids) ? 1 : max($ids) + 1), 'rating'=>4.5, 'popularity'=>50, 'year'=>(int)date('Y')]);
        $books[] = $book->toArray();
        $this->writeJson($this->booksFile, $books);
        return $book;
    }

    public function updateBook(int $id, array $data): Book
    {
        $this->requireAdmin();
        $books = $this->readJson($this->booksFile); $updated = null;
        foreach ($books as &$row) if ((int)$row['id'] === $id) {
            $book = new Book(array_merge($row, $data, ['id'=>$id]));
            $row = $book->toArray(); $updated = $book; break;
        }
        unset($row);
        if (!$updated) throw new RuntimeException('Buku tidak ditemukan.');
        $this->writeJson($this->booksFile, $books);
        return $updated;
    }

    private function requireAdmin(): void
    {
        if (!$this->getCurrentUser() instanceof Admin) throw new RuntimeException('Aksi ini hanya tersedia untuk Admin.');
    }

    public function updateProfile(string $name, string $email): User
    {
        $name = trim($name); $email = trim($email);
        if (strlen($name) < 3) throw new InvalidArgumentException('Nama minimal 3 karakter.');
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) throw new InvalidArgumentException('Format email tidak valid.');
        $users = $this->readJson($this->usersFile); $updated = null; $id = (int)($_SESSION['user_id'] ?? 1);
        foreach ($users as &$row) {
            if ((int)$row['id'] === $id) {
                foreach ($users as $other) if ((int)$other['id'] !== $id && strtolower($other['email']) === strtolower($email)) throw new RuntimeException('Email sudah digunakan akun lain.');
                $user = $this->hydrateUser($row); $user->setName($name); $user->setEmail($email);
                $row = $user instanceof Member ? $user->toStorageArray() : $user->toStorageArray(); $updated = $user; break;
            }
        }
        unset($row);
        if (!$updated) throw new RuntimeException('Pengguna tidak ditemukan.');
        $this->writeJson($this->usersFile, $users);
        return $updated;
    }

    public function toggleFavorite(int $bookId): array
    {
        $user = $this->getCurrentUser();
        if (!$user instanceof Member) throw new RuntimeException('Favorit hanya tersedia untuk Member.');
        $bookExists = false;
        foreach ($this->readJson($this->booksFile) as $book) if ((int)$book['id'] === $bookId) $bookExists = true;
        if (!$bookExists) throw new RuntimeException('Buku tidak ditemukan.');
        $users = $this->readJson($this->usersFile); $favorites = [];
        foreach ($users as &$row) if ((int)$row['id'] === $user->getId()) {
            $member = $this->hydrateUser($row); $member->toggleFavorite($bookId); $favorites = $member->getFavorites(); $row = $member->toStorageArray(); break;
        }
        unset($row); $this->writeJson($this->usersFile, $users);
        return $favorites;
    }

    public function getMembersForTable(): array
    {
        $transactions = $this->readJson($this->transactionsFile); $rows = [];
        foreach ($this->readJson($this->usersFile) as $u) {
            $user = $this->hydrateUser($u);
            if ($user instanceof Member) {
                $count = count(array_filter($transactions, static fn($t) => (int)($t['member_id'] ?? 1) === $user->getId()));
                $rows[] = [$user->getName(), $user->getEmail(), $user->getJoinedAt(), (string)$count, $user->getStatus()];
            }
        }
        return $rows;
    }

    public function getMemberFavorites(): array
    {
        $user = $this->getCurrentUser();
        return $user instanceof Member ? $user->getFavorites() : [];
    }
}
