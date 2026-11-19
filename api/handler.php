<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/config.php';

use App\Services\LibraryService;

header('Content-Type: application/json; charset=utf-8');

function jsonResponse(bool $success, string $message, mixed $data = null, int $code = 200): void
{
    http_response_code($code);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $service = new LibraryService();
    $action = $_GET['action'] ?? '';
    $input = json_decode(file_get_contents('php://input'), true) ?? $_POST;

    switch ($action) {
        case 'init':
            $user = $service->getCurrentUser();
            jsonResponse(true, 'Data dimuat', [
                'role' => strtolower($user->getRole()),
                'books' => $service->getAllBooks(),
                'loans' => $service->getTransactions(),
                'members' => $service->getMembersForTable(),
                'favorites' => $service->getMemberFavorites(),
            ]);
            break;

        case 'switch_role':
            $user = $service->switchRoleSession($input['role'] ?? 'member');
            jsonResponse(true, 'Mode diubah', ['role' => strtolower($user->getRole())]);
            break;

        case 'borrow':
            $trx = $service->borrowBook((int)($input['bookId'] ?? 0));
            jsonResponse(true, 'Buku berhasil dipinjam.', $trx->toArray());
            break;

        case 'favorite':
            $favs = $service->toggleFavorite((int)($input['bookId'] ?? 0));
            jsonResponse(true, 'Favorit diperbarui.', $favs);
            break;

        case 'add_book':
            $book = $service->createBook($input);
            jsonResponse(true, 'E-book berhasil ditambahkan.', $book->toArray());
            break;

        case 'edit_book':
            $book = $service->updateBook((int)($input['id'] ?? 0), $input);
            jsonResponse(true, 'Informasi e-book berhasil diperbarui.', $book->toArray());
            break;

        case 'complete_loan':
            $trx = $service->returnBook((string)($input['id'] ?? ''));
            jsonResponse(true, 'Transaksi ditandai selesai.', $trx->toArray());
            break;

        case 'update_profile':
            $user = $service->updateProfile($input['name'] ?? '', $input['email'] ?? '');
            jsonResponse(true, 'Profil diperbarui.', $user->toArray());
            break;

        default:
            jsonResponse(false, 'Action tidak valid.', null, 404);
    }
} catch (\Throwable $e) {
    jsonResponse(false, $e->getMessage(), null, 400);
}