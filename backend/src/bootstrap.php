<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
ini_set('display_errors', '0');
session_name('rose_local_session');
session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax', 'path' => '/api/']);
session_start();

class ApiError extends RuntimeException {}

function fail(int $status, string $message): never {
    throw new ApiError($message, $status);
}

function respond(array $data, int $status = 200): never {
    http_response_code($status);
    echo json_encode($data, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
    exit;
}

set_exception_handler(function (Throwable $error) {
    if ($error instanceof ApiError) {
        respond(['error' => $error->getMessage()], $error->getCode());
    }
    error_log((string) $error);
    respond(['error' => 'The API could not complete the request. Check the PHP terminal and the database connection.'], 500);
});

function db(): PDO {
    static $pdo;
    if (!$pdo) {
        $config = require __DIR__ . '/../config/database.php';
        $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4',
            $config['host'], $config['port'], $config['database']);
        $pdo = new PDO($dsn, $config['username'], $config['password'], [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ]);
    }
    return $pdo;
}

function query(string $sql, array $params = []): PDOStatement {
    $statement = db()->prepare($sql);
    $statement->execute($params);
    return $statement;
}

function body(): array {
    if (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') {
        fail(415, 'Send a JSON request.');
    }
    $data = json_decode(file_get_contents('php://input'), true);
    if (!is_array($data)) fail(400, 'Enter a valid JSON object.');
    return $data;
}

function field(array $data, string $key, int $limit): string {
    $value = $data[$key] ?? '';
    if (!is_string($value) || trim($value) === '' || !preg_match('/^.{1,' . $limit . '}$/usD', trim($value))) {
        fail(422, 'Check the ' . $key . ' field.');
    }
    return trim($value);
}

function staffId(): int {
    $id = $_SESSION['staff'] ?? 0;
    if (!$id || !query("SELECT id FROM rose_staff_users WHERE id = ? AND active = 1 AND role = 'manager'", [$id])->fetchColumn()) {
        unset($_SESSION['staff']);
        fail(401, 'Sign in with the local staff account.');
    }
    return (int) $id;
}

function methodNotAllowed(string $allowed): never {
    header('Allow: ' . $allowed);
    fail(405, 'This HTTP method is unavailable here.');
}

function transaction(callable $work): mixed {
    $pdo = db();
    $pdo->beginTransaction();
    try {
        $result = $work();
        $pdo->commit();
        return $result;
    } catch (Throwable $error) {
        $pdo->rollBack();
        throw $error;
    }
}

function lockEvent(string $slug): array {
    $event = query("SELECT id, capacity FROM rose_events
        WHERE slug = ? AND publication_status = 'published' FOR UPDATE", [$slug])->fetch();
    if (!$event) fail(404, 'Event not found.');
    return $event;
}

function confirmedCount(int $eventId): int {
    return (int) query("SELECT COUNT(*) FROM rose_bookings WHERE event_id = ? AND status = 'confirmed'", [$eventId])->fetchColumn();
}

function requestKey(array $data): string {
    $key = field($data, 'requestId', 36);
    if (!preg_match('/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/iD', $key)) {
        fail(422, 'Enter a valid requestId.');
    }
    return strtolower($key);
}
