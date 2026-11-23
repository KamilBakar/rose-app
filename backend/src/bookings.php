<?php
declare(strict_types=1);

function bookingRows(?string $reference = null): array {
    $sql = "SELECT b.reference, e.slug AS eventId, b.participant_name AS name,
                COALESCE(b.phone, '') AS phone, COALESCE(l.referral_code, 'general') AS referral,
                b.status, (a.booking_id IS NOT NULL) AS attended,
                CASE WHEN b.status = 'waiting' THEN (
                    SELECT COUNT(*) FROM rose_bookings w WHERE w.event_id = b.event_id
                    AND w.status = 'waiting' AND w.id <= b.id
                ) END AS position
            FROM rose_bookings b
            JOIN rose_events e ON e.id = b.event_id
            LEFT JOIN rose_community_leaders l ON l.id = b.leader_id
            LEFT JOIN rose_attendance a ON a.booking_id = b.id
            WHERE e.publication_status = 'published'";
    if ($reference !== null) $sql .= ' AND b.reference = ?';
    $sql .= ' ORDER BY b.id';
    $rows = query($sql, $reference === null ? [] : [$reference])->fetchAll();
    foreach ($rows as &$row) {
        $row['attended'] = (bool) $row['attended'];
        if ($row['position'] !== null) $row['position'] = (int) $row['position'];
    }
    return $rows;
}

function findBooking(string $reference): array {
    $booking = bookingRows($reference)[0] ?? null;
    if (!$booking) fail(404, 'Booking not found.');
    return $booking;
}

function requireBookingAccess(string $reference): void {
    if (empty($_SESSION['bookings'][$reference])) {
        if (empty($_SESSION['staff'])) fail(404, 'Use My Bookings to look up your booking.');
        staffId();
    }
}

function createBooking(array $data, bool $walkIn): string {
    $staff = $walkIn ? staffId() : null;
    $slug = field($data, 'eventId', 100);
    $name = field($data, 'name', 180);
    $phone = field($data, 'phone', 50);
    if (!preg_match('/[0-9]/', $phone)) fail(422, 'Enter a phone number.');
    $referral = $walkIn ? 'general' : field($data, 'referral', 50);

    if (!$walkIn) {
        foreach (['resident', 'b40', 'eligible'] as $criterion) {
            if (($data[$criterion] ?? false) !== true) fail(422, 'Confirm the eligibility checklist.');
        }
        if (!in_array($data['income'] ?? null, ['below-2500', '2500-3999', '4000-plus'], true)) {
            fail(422, 'Choose a household income range.');
        }
    }
    // A retry from this form returns the original reference. The raw key is never stored.
    $token = hash('sha256', session_id() . '|' . $slug . '|' . requestKey($data));
    return transaction(function () use ($slug, $name, $phone, $referral, $staff, $walkIn, $token) {
        $event = lockEvent($slug);
        $previous = query('SELECT reference FROM rose_bookings WHERE access_token_hash = ?', [$token])->fetchColumn();
        if ($previous) return $previous;
        $leader = null;
        if ($referral !== 'general') {
            $leader = query('SELECT id FROM rose_community_leaders WHERE referral_code = ?', [$referral])->fetchColumn();
            if (!$leader) fail(422, 'Choose a valid referral source.');
        }
        $full = confirmedCount((int) $event['id']) >= (int) $event['capacity'];
        if ($full && $walkIn) fail(409, 'This event is full. No walk-in place is available.');
        $reference = 'ROSE-' . strtoupper(bin2hex(random_bytes(10)));
        query('INSERT INTO rose_bookings
              (event_id, reference, access_token_hash, participant_name, phone, leader_id, status, entry_type)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
            $event['id'], $reference, $token, $name, $phone, $leader,
            $full ? 'waiting' : 'confirmed', $walkIn ? 'walk_in' : 'advance',
        ]);
        if ($walkIn) {
            query('INSERT INTO rose_attendance (booking_id, staff_id) VALUES (?, ?)', [db()->lastInsertId(), $staff]);
        }
        return $reference;
    });
}

function changeBooking(string $reference, bool $checkIn): void {
    $staff = null;
    if ($checkIn) $staff = staffId();
    else requireBookingAccess($reference);
    $booking = findBooking($reference);
    transaction(function () use ($reference, $booking, $checkIn, $staff) {
        lockEvent($booking['eventId']);
        $row = query('SELECT id, status FROM rose_bookings WHERE reference = ? FOR UPDATE', [$reference])->fetch();
        if (!$row) fail(404, 'Booking not found.');
        if ($checkIn) {
            if ($row['status'] !== 'confirmed') fail(409, 'Only confirmed bookings can check in.');
            query('INSERT INTO rose_attendance (booking_id, staff_id) VALUES (?, ?)
                  ON DUPLICATE KEY UPDATE booking_id = booking_id', [$row['id'], $staff]);
        } elseif ($row['status'] !== 'cancelled') {
            query('DELETE FROM rose_attendance WHERE booking_id = ?', [$row['id']]);
            query("UPDATE rose_bookings SET status = 'cancelled', cancelled_at = CURRENT_TIMESTAMP WHERE id = ?", [$row['id']]);
        }
    });
}
