<?php
declare(strict_types=1);

require_once dirname(__DIR__) . '/config/config.php';

use App\Services\LibraryService;

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');

function jsonResponse(bool $success, string $message, mixed $data = null, int $code = 200): void
{
    http_response_code($code);
    echo json_encode(['success'=>$success, 'message'=>$message, 'data'=>$data], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

try {
    $service = new LibraryService();
    $action = (string)($_GET['action'] ?? '');
    $raw = file_get_contents('php://input');
    $decoded = $raw !== '' ? json_decode($raw, true) : null;
    $input = is_array($decoded) ? $decoded : $_POST;

    switch ($action) {
        case 'init':
            $user = $service->getCurrentUser();
            jsonResponse(true, 'Data berhasil dimuat.', [
                'user'=>$user->toArray(),
                'role'=>strtolower($user->getRole()),
                'books'=>$service->getAllBooks(),
                'loans'=>$service->getTransactions(),
                'members'=>$service->getMembersForTable(),
                'favorites'=>$service->getMemberFavorites(),
            ]);
        case 'switch_role':
            $user = $service->switchRoleSession((string)($input['role'] ?? 'member'));
            jsonResponse(true, 'Mode berhasil diubah.', ['role'=>strtolower($user->getRole()), 'user'=>$user->toArray()]);
        case 'borrow':
            $trx = $service->borrowBook((int)($input['bookId'] ?? 0));
            jsonResponse(true, 'Buku berhasil dipinjam.', $trx->toArray(), 201);
        case 'favorite':
            jsonResponse(true, 'Favorit berhasil diperbarui.', $service->toggleFavorite((int)($input['bookId'] ?? 0)));
        case 'add_book':
            jsonResponse(true, 'E-book berhasil ditambahkan.', $service->createBook($input)->toArray(), 201);
        case 'edit_book':
            jsonResponse(true, 'Informasi e-book berhasil diperbarui.', $service->updateBook((int)($input['id'] ?? 0), $input)->toArray());
        case 'complete_loan':
            jsonResponse(true, 'Transaksi berhasil diselesaikan.', $service->returnBook((string)($input['id'] ?? ''))->toArray());
        case 'update_profile':
            jsonResponse(true, 'Profil berhasil diperbarui.', $service->updateProfile((string)($input['name'] ?? ''), (string)($input['email'] ?? ''))->toArray());
        default:
            jsonResponse(false, 'Action tidak ditemukan.', null, 404);
    }
} catch (InvalidArgumentException $e) {
    jsonResponse(false, $e->getMessage(), null, 422);
} catch (Throwable $e) {
    jsonResponse(false, $e->getMessage(), null, 400);
}
