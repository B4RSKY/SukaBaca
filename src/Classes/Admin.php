<?php
namespace App\Classes;

class Admin extends User
{
    public function getRole(): string
    {
        return 'Admin';
    }

    public function getPermissions(): array
    {
        return ['manage_books', 'view_members', 'manage_transactions', 'export_reports'];
    }
}