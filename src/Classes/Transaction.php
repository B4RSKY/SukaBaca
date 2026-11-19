<?php
namespace App\Classes;

class Transaction
{
    private string $id;
    private int $memberId;
    private int $bookId;
    private string $borrowDate;
    private string $dueDate;
    private string $status;
    private int $progress;

    public function __construct(array $data)
    {
        $this->id = $data['id'];
        $this->memberId = (int)$data['member_id'];
        $this->bookId = (int)$data['book_id'];
        $this->borrowDate = $data['borrow_date'];
        $this->dueDate = $data['due_date'];
        $this->status = $data['status'] ?? 'Berlangsung';
        $this->progress = (int)($data['progress'] ?? 0);
    }

    public function getId(): string { return $this->id; }
    public function getMemberId(): int { return $this->memberId; }
    public function getBookId(): int { return $this->bookId; }
    public function getStatus(): string { return $this->status; }

    public function markAsReturned(): void
    {
        $this->status = 'Selesai';
        $this->progress = 100;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'member_id' => $this->memberId,
            'book_id' => $this->bookId,
            'borrow_date' => $this->borrowDate,
            'due_date' => $this->dueDate,
            'status' => $this->status,
            'progress' => $this->progress,
        ];
    }
}