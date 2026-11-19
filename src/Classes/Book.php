<?php
namespace App\Classes;

use InvalidArgumentException;

class Book
{
    private int $id;
    private string $title;
    private string $author;
    private string $category;
    private float $rating;
    private string $color;
    private string $cover;
    private int $stock;
    private int $popularity;
    private int $year;
    private string $description;

    public function __construct(array $data)
    {
        $this->id = (int)($data['id'] ?? 0);
        $this->setTitle($data['title'] ?? '');
        $this->setAuthor($data['author'] ?? '');
        $this->setCategory($data['category'] ?? 'Umum');
        $this->rating = (float)($data['rating'] ?? 4.5);
        $this->color = $data['color'] ?? 'cover-teal';
        $this->cover = $data['cover'] ?? strtoupper(substr($this->title, 0, 25));
        $this->setStock((int)($data['stock'] ?? 0));
        $this->popularity = (int)($data['popularity'] ?? 75);
        $this->year = (int)($data['year'] ?? (int)date('Y'));
        $this->description = $data['description'] ?? '';
    }

    public function getId(): int { return $this->id; }
    public function getTitle(): string { return $this->title; }
    public function getAuthor(): string { return $this->author; }
    public function getCategory(): string { return $this->category; }
    public function getStock(): int { return $this->stock; }

    public function setTitle(string $title): void
    {
        if (trim($title) === '') {
            throw new InvalidArgumentException('Judul buku tidak boleh kosong.');
        }
        $this->title = trim($title);
    }

    public function setAuthor(string $author): void
    {
        if (trim($author) === '') {
            throw new InvalidArgumentException('Penulis buku tidak boleh kosong.');
        }
        $this->author = trim($author);
    }

    public function setCategory(string $category): void
    {
        $this->category = trim($category);
    }

    public function setStock(int $stock): void
    {
        if ($stock < 0) {
            throw new InvalidArgumentException('Stok buku tidak boleh negatif.');
        }
        $this->stock = $stock;
    }

    public function decrementStock(): void
    {
        if ($this->stock <= 0) {
            throw new InvalidArgumentException('Stok buku habis.');
        }
        $this->stock--;
    }

    public function incrementStock(): void
    {
        $this->stock++;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'author' => $this->author,
            'category' => $this->category,
            'rating' => $this->rating,
            'color' => $this->color,
            'cover' => $this->cover,
            'stock' => $this->stock,
            'popularity' => $this->popularity,
            'year' => $this->year,
            'description' => $this->description,
        ];
    }
}