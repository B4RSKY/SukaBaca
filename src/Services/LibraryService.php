<?php
namespace App\Services;

use App\Classes\Admin;
use App\Classes\Book;
use App\Classes\Member;
use App\Classes\Transaction;
use App\Classes\User;
use RuntimeException;

class LibraryService
{
    private string $usersFile;
    private string $booksFile;
    private string $transactionsFile;

    public function __construct(string $dataDir)
    {
        if (!is_dir($dataDir)) {
            mkdir($dataDir, 0777, true);
        }

        $this->usersFile = $dataDir . '/users.json';
        $this->booksFile = $dataDir . '/books.json';
        $this->transactionsFile = $dataDir . '/transactions.json';
    }

    private function readJson(string $file): array
    {
        if (!file_exists($file)) {
            return [];
        }
        return json_decode(file_get_contents($file), true) ?: [];
    }

    private function writeJson(string $file, array $data): void
    {
        file_put_contents($file, json_encode(array_values($data), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    private function createUserObject(array $row): User
    {
        if (($row['role'] ?? 'Member') === 'Admin') {
            return new Admin((int)$row['id'], $row['name'], $row['email'], $row['password'], $row['joined_at'], $row['status']);
        }
        return new Member((int)$row['id'], $row['name'], $row['email'], $row['password'], $row['joined_at'], $row['status'], $row['favorites'] ?? []);
    }

    // --- Manajemen User (Member & Admin) ---
    public function registerMember(string $name, string $email, string $password): Member
    {
        $users = $this->readJson($this->usersFile);
        foreach ($users as $row) {
            if (strcasecmp($row['email'], trim($email)) === 0) {
                throw new RuntimeException('Email sudah terdaftar.');
            }
        }

        $id = empty($users) ? 1 : max(array_column($users, 'id')) + 1;
        $member = new Member($id, trim($name), trim($email), password_hash($password, PASSWORD_DEFAULT));
        $users[] = $member->toStorageArray();
        $this->writeJson($this->usersFile, $users);

        return $member;
    }

    public function authenticate(string $email, string $password): User
    {
        foreach ($this->readJson($this->usersFile) as $row) {
            if (strcasecmp($row['email'], trim($email)) === 0) {
                $user = $this->createUserObject($row);
                if (!$user->verifyPassword($password)) {
                    throw new RuntimeException('Password tidak sesuai.');
                }
                return $user;
            }
        }
        throw new RuntimeException('Pengguna tidak ditemukan.');
    }

    // --- Manajemen Buku ---
    public function getBooks(): array
    {
        return array_map(fn($row) => new Book($row), $this->readJson($this->booksFile));
    }

    public function addBook(User $actor, array $data): Book
    {
        if ($actor->getRole() !== 'Admin') {
            throw new RuntimeException('Akses ditolak: Hanya Admin yang dapat menambah buku.');
        }

        $books = $this->readJson($this->booksFile);
        $data['id'] = empty($books) ? 1 : max(array_column($books, 'id')) + 1;

        $book = new Book($data);
        $books[] = $book->toArray();
        $this->writeJson($this->booksFile, $books);

        return $book;
    }

    public function updateBook(User $actor, int $id, array $data): Book
    {
        if ($actor->getRole() !== 'Admin') {
            throw new RuntimeException('Akses ditolak: Hanya Admin yang dapat mengubah buku.');
        }

        $books = $this->readJson($this->booksFile);
        $updated = null;

        foreach ($books as &$row) {
            if ((int)$row['id'] === $id) {
                $book = new Book($row);
                if (isset($data['title'])) $book->setTitle($data['title']);
                if (isset($data['author'])) $book->setAuthor($data['author']);
                if (isset($data['category'])) $book->setCategory($data['category']);
                if (isset($data['stock'])) $book->setStock((int)$data['stock']);
                $row = $book->toArray();
                $updated = $book;
                break;
            }
        }

        if (!$updated) {
            throw new RuntimeException('Buku tidak ditemukan.');
        }

        $this->writeJson($this->booksFile, $books);
        return $updated;
    }

    public function deleteBook(User $actor, int $id): void
    {
        if ($actor->getRole() !== 'Admin') {
            throw new RuntimeException('Akses ditolak: Hanya Admin yang dapat menghapus buku.');
        }

        $books = $this->readJson($this->booksFile);
        $filtered = array_filter($books, fn($b) => (int)$b['id'] !== $id);
        $this->writeJson($this->booksFile, $filtered);
    }

    // --- Peminjaman & Pengembalian ---
    public function borrowBook(User $actor, int $bookId): Transaction
    {
        if ($actor->getRole() !== 'Member') {
            throw new RuntimeException('Hanya Member yang dapat meminjam buku.');
        }

        $books = $this->readJson($this->booksFile);
        $transactions = $this->readJson($this->transactionsFile);

        $targetBook = null;
        foreach ($books as &$row) {
            if ((int)$row['id'] === $bookId) {
                $book = new Book($row);
                $book->decrementStock();
                $row = $book->toArray();
                $targetBook = $book;
                break;
            }
        }

        if (!$targetBook) {
            throw new RuntimeException('Buku tidak ditemukan.');
        }

        $trx = new Transaction([
            'id' => sprintf('TRX-%s-%04d', date('Y'), count($transactions) + 1),
            'member_id' => $actor->getId(),
            'book_id' => $targetBook->getId(),
            'borrow_date' => date('Y-m-d'),
            'due_date' => date('Y-m-d', strtotime('+7 days')),
            'status' => 'Berlangsung',
            'progress' => 0,
        ]);

        $transactions[] = $trx->toArray();
        $this->writeJson($this->booksFile, $books);
        $this->writeJson($this->transactionsFile, $transactions);

        return $trx;
    }

    public function returnBook(string $transactionId): Transaction
    {
        $transactions = $this->readJson($this->transactionsFile);
        $books = $this->readJson($this->booksFile);
        $completed = null;

        foreach ($transactions as &$tRow) {
            if ($tRow['id'] === $transactionId) {
                $trx = new Transaction($tRow);
                $trx->markAsReturned();
                $tRow = $trx->toArray();
                $completed = $trx;

                foreach ($books as &$bRow) {
                    if ((int)$bRow['id'] === $trx->getBookId()) {
                        $book = new Book($bRow);
                        $book->incrementStock();
                        $bRow = $book->toArray();
                        break;
                    }
                }
                break;
            }
        }

        if (!$completed) {
            throw new RuntimeException('Transaksi tidak ditemukan.');
        }

        $this->writeJson($this->transactionsFile, $transactions);
        $this->writeJson($this->booksFile, $books);
        return $completed;
    }
}