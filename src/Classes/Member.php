<?php
namespace App\Classes;

class Member extends User
{
    private array $favorites;

    public function __construct(
        int $id,
        string $name,
        string $email,
        string $passwordHash,
        string $joinedAt = '',
        string $status = 'Aktif',
        array $favorites = []
    ) {
        parent::__construct($id, $name, $email, $passwordHash, $joinedAt, $status);
        $this->favorites = $favorites;
    }

    // Polymorphism: Override method parent
    public function getRole(): string
    {
        return 'Member';
    }

    public function getPermissions(): array
    {
        return ['view_books', 'borrow_book', 'view_own_loans', 'edit_profile'];
    }

    public function getFavorites(): array
    {
        return $this->favorites;
    }

    public function toggleFavorite(int $bookId): bool
    {
        if (in_array($bookId, $this->favorites, true)) {
            $this->favorites = array_values(array_diff($this->favorites, [$bookId]));
            return false;
        }
        $this->favorites[] = $bookId;
        return true;
    }

    public function toArray(): array
    {
        $data = parent::toArray();
        $data['favorites'] = $this->favorites;
        return $data;
    }

    public function toStorageArray(): array
    {
        $data = parent::toStorageArray();
        $data['favorites'] = $this->favorites;
        return $data;
    }
}