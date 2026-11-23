-- Example seed data
USE rose_local;
START TRANSACTION;
SET @today = DATE(UTC_TIMESTAMP() + INTERVAL 8 HOUR);

INSERT INTO rose_community_leaders (referral_code, display_name) VALUES
    ('aisha', 'Aisha Group'), ('batu', 'Batu Community'), ('seri', 'Seri Network')
ON DUPLICATE KEY UPDATE id = id;

-- Local prototype staff account: staff@example.com / demo123
INSERT INTO rose_staff_users (email, password_hash, role)
VALUES ('staff@example.com', '$2y$12$tKwzD8rOetTNGNOAGIrUb.tj8runlJFW7CusuoPig0sYfCErkp/De', 'manager')
ON DUPLICATE KEY UPDATE id = id;

INSERT INTO rose_events
    (slug, title, description, location, event_date, start_time, end_time, capacity, publication_status)
VALUES
    ('womens-health-screening', 'Women''s Health Screening', 'Free community screening for eligible women.',
     'Community Center A', @today + INTERVAL 7 DAY, '09:00', '12:00', 12, 'published'),
    ('cervical-screening-day', 'Cervical Screening Day', 'Community screening with a waiting list when all places are taken.',
     'Community Center B', @today + INTERVAL 14 DAY, '10:00', '13:00', 2, 'published'),
    ('breast-health-awareness', 'Breast Health Awareness', 'Meet the ROSE team at a community awareness session.',
     'Community Center C', @today + INTERVAL 21 DAY, '09:30', '11:30', 8, 'published')
ON DUPLICATE KEY UPDATE id = id;

SET @full_event = (SELECT id FROM rose_events WHERE slug = 'cervical-screening-day');
SET @third_event = (SELECT id FROM rose_events WHERE slug = 'breast-health-awareness');
SET @aisha = (SELECT id FROM rose_community_leaders WHERE referral_code = 'aisha');

INSERT INTO rose_bookings (reference, event_id, participant_name, phone, leader_id, status) VALUES
    ('ROSE-LOCAL-004', @full_event, 'Test Participant D', '012 000 0004', NULL, 'confirmed'),
    ('ROSE-LOCAL-005', @full_event, 'Test Participant E', '012 000 0005', @aisha, 'confirmed'),
    ('ROSE-LOCAL-006', @full_event, 'Test Participant F', '012 000 0006', NULL, 'waiting'),
    ('ROSE-REF12345', @third_event, 'Demo Participant', '012 000 0001', NULL, 'confirmed')
ON DUPLICATE KEY UPDATE id = id;

COMMIT;
