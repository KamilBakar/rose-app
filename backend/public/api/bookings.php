<?php
declare(strict_types=1);
require __DIR__ . '/../../src/bootstrap.php';
require __DIR__ . '/../../src/bookings.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (isset($_GET['reference'])) {
        $reference = strtoupper(field($_GET, 'reference', 40));
        requireBookingAccess($reference);
        respond(['booking' => findBooking($reference)]);
    }
    staffId();
    respond(['bookings' => bookingRows()]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') methodNotAllowed('GET, POST');
$data = body();
switch ($data['action'] ?? 'create') {
    case 'create':
    case 'walkIn':
        $walkIn = ($data['action'] ?? '') === 'walkIn';
        $reference = createBooking($data, $walkIn);
        if (!$walkIn) $_SESSION['bookings'][$reference] = true;
        respond(['reference' => $reference], 201);

    case 'lookup':
        $reference = strtoupper(field($data, 'reference', 40));
        $name = field($data, 'name', 180);
        $found = query('SELECT reference FROM rose_bookings WHERE reference = ? AND LOWER(participant_name) = LOWER(?)',
            [$reference, $name])->fetchColumn();
        if (!$found) fail(404, 'We couldn’t find a booking with that reference and name.');
        $_SESSION['bookings'][$found] = true;
        respond(['reference' => $found]);

    case 'cancel':
    case 'checkIn':
        $reference = strtoupper(field($data, 'reference', 40));
        changeBooking($reference, $data['action'] === 'checkIn');
        respond(['booking' => findBooking($reference)]);

    default:
        fail(422, 'Unknown booking action.');
}
