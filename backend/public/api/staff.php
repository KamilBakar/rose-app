<?php
declare(strict_types=1);
require __DIR__ . '/../../src/bootstrap.php';

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if (empty($_SESSION['staff'])) respond(['signedIn' => false]);
        try {
            staffId();
        } catch (ApiError $error) {
            if ($error->getCode() !== 401) throw $error;
            respond(['signedIn' => false]);
        }
        respond(['signedIn' => true]);

    case 'POST':
        $data = body();
        if (($data['action'] ?? '') === 'logout') {
            unset($_SESSION['staff']);
            session_regenerate_id(true);
            respond(['signedIn' => false]);
        }
        $user = query("SELECT id, password_hash FROM rose_staff_users WHERE email = ? AND active = 1 AND role = 'manager'",
            [field($data, 'email', 254)])->fetch();
        $password = $data['password'] ?? null;
        if (!$user || !is_string($password) || !password_verify($password, $user['password_hash'])) {
            fail(401, 'The email or password is incorrect.');
        }
        session_regenerate_id(true);
        $_SESSION['staff'] = (int) $user['id'];
        respond(['signedIn' => true]);
    default:
        methodNotAllowed('GET, POST');
}
