<?php
declare(strict_types=1);
require __DIR__ . '/../../src/bootstrap.php';

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $slug = isset($_GET['id']) ? field($_GET, 'id', 100) : null;
    $sql = "SELECT e.id AS event_id, e.slug, e.title, e.description, e.location,
                   e.event_date, TIME_FORMAT(e.start_time, '%H:%i') AS start_time,
                   TIME_FORMAT(e.end_time, '%H:%i') AS end_time, e.capacity,
                   b.status, COALESCE(l.referral_code, 'general') AS referral, COUNT(b.id) AS total
            FROM rose_events e
            LEFT JOIN rose_bookings b ON b.event_id = e.id AND b.status IN ('confirmed', 'waiting')
            LEFT JOIN rose_community_leaders l ON l.id = b.leader_id
            WHERE e.publication_status = 'published'";
    if ($slug !== null) $sql .= ' AND e.slug = ?';
    $sql .= ' GROUP BY e.id, e.slug, e.title, e.description, e.location, e.event_date, e.start_time,
                       e.end_time, e.capacity, b.status, l.referral_code
              ORDER BY e.event_date, e.start_time, e.id';
    $events = [];
    foreach (query($sql, $slug === null ? [] : [$slug]) as $row) {
        $id = $row['slug'];
        if (!isset($events[$id])) {
            $events[$id] = [
                'id' => $id, 'title' => $row['title'], 'description' => $row['description'],
                'location' => $row['location'], 'date' => $row['event_date'],
                'startTime' => $row['start_time'], 'endTime' => $row['end_time'],
                'capacity' => (int) $row['capacity'], 'booked' => 0, 'waitlist' => 0,
                'remaining' => (int) $row['capacity'], 'referrals' => (object) [],
            ];
        }
        $count = (int) $row['total'];
        if ($row['status'] === 'confirmed') {
            $events[$id]['referrals']->{$row['referral']} = $count;
            $events[$id]['booked'] += $count;
            $events[$id]['remaining'] = max(0, $events[$id]['capacity'] - $events[$id]['booked']);
        } elseif ($row['status'] === 'waiting') {
            $events[$id]['waitlist'] += $count;
        }
    }
    if ($slug === null) respond(['events' => array_values($events)]);
    if (!isset($events[$slug])) fail(404, 'Event not found.');
    respond(['event' => $events[$slug]]);
}

if (!in_array($method, ['POST', 'PUT'], true)) methodNotAllowed('GET, POST, PUT');
staffId();
$data = body();
$title = field($data, 'title', 180);
$description = field($data, 'description', 8000);
$location = field($data, 'location', 180);
$date = field($data, 'date', 10);
$start = field($data, 'startTime', 5);
$end = field($data, 'endTime', 5);
$day = DateTimeImmutable::createFromFormat('!Y-m-d', $date);
if (!$day || $day->format('Y-m-d') !== $date || (int) $day->format('Y') < 1000) fail(422, 'Enter a valid event date.');
foreach ([$start, $end] as $time) {
    if (!preg_match('/^(?:[01][0-9]|2[0-3]):[0-5][0-9]$/D', $time)) fail(422, 'Enter a valid event time.');
}
if ($end <= $start) fail(422, 'Choose an end time after the start time.');
$capacity = filter_var($data['capacity'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1, 'max_range' => 4294967295]]);
if ($capacity === false) fail(422, 'Choose a positive whole-number capacity.');
$fields = [$title, $description, $location, $date, $start, $end, $capacity];

if ($method === 'POST') {
    $slug = 'event-' . requestKey($data);
    query("INSERT INTO rose_events (title, description, location, event_date, start_time, end_time, capacity, slug, publication_status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'published') ON DUPLICATE KEY UPDATE id = id", [...$fields, $slug]);
    respond(['id' => $slug], 201);
}

$slug = field($_GET, 'id', 100);
transaction(function () use ($slug, $fields, $capacity) {
    $event = lockEvent($slug);
    if ($capacity < confirmedCount((int) $event['id'])) fail(409, 'Capacity must cover the existing confirmed bookings.');
    query('UPDATE rose_events SET title = ?, description = ?, location = ?, event_date = ?, start_time = ?,
          end_time = ?, capacity = ? WHERE id = ?', [...$fields, $event['id']]);
});
respond(['id' => $slug]);
