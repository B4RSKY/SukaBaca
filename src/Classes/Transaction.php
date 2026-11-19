<?php
namespace App\Classes;

class Transaction
{
    private string $id;
    private int $memberId;
    private int $bookId;
    private string $date;
    private string $due;
    private string $status;
    private int $progress;

    public function __construct(array $data)
    {
        $this->id = $data['id'];
        $this->memberId = (int)($data['member_id'] ?? 1);
        $this->bookId = (int)($data['bookId'] ?? $data['book_id'] ?? 0);
        $this->date = $data['date'] ?? $data['borrow_date'] ?? date('d M Y');
        $this->due = $data['due'] ?? $data['due_date'] ?? date('d M Y', strtotime('+14 days'));
        $this->status = $data['status'] ?? 'Berlangsung';
        $this->progress = (int)($data['progress'] ?? 0);
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function getMemberId(): int
    {
        return $this->memberId;
    }

    public function getBookId(): int
    {
        return $this->bookId;
    }

    public function getStatus(): string
    {
        return $this->status;
    }

    public function markAsCompleted(): void
    {
        $this->status = 'Selesai';
        $this->progress = 100;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'member_id' => $this->memberId,
            'bookId' => $this->bookId,
            'date' => $this->date,
            'due' => $this->due,
            'status' => $this->status,
            'progress' => $this->progress,
        ];
    }
}