<?php
namespace App\Classes;

abstract class User
{
    protected int $id;
    protected string $name;
    protected string $email;
    private string $passwordHash;
    protected string $joinedAt;
    protected string $status;

    public function __construct(
        int $id,
        string $name,
        string $email,
        string $passwordHash,
        string $joinedAt = '',
        string $status = 'Aktif'
    ) {
        $this->id = $id;
        $this->name = $name;
        $this->email = $email;
        $this->passwordHash = $passwordHash;
        $this->joinedAt = $joinedAt ?: date('d M Y');
        $this->status = $status;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function setName(string $name): void
    {
        $this->name = trim($name);
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): void
    {
        $this->email = trim($email);
    }

    public function getJoinedAt(): string
    {
        return $this->joinedAt;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function verifyPassword(string $plainPassword): bool
    {
        return password_verify($plainPassword, $this->passwordHash);
    }

    abstract public function getRole(): string;
    abstract public function getPermissions(): array;

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->getRole(),
            'joined_at' => $this->joinedAt,
            'status' => $this->status,
            'permissions' => $this->getPermissions(),
        ];
    }

    public function toStorageArray(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'password' => $this->passwordHash,
            'role' => $this->getRole(),
            'joined_at' => $this->joinedAt,
            'status' => $this->status,
        ];
    }
}