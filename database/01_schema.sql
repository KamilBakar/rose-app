-- Each table
CREATE DATABASE IF NOT EXISTS rose_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rose_local;

CREATE TABLE IF NOT EXISTS rose_events (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(180) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(180) NOT NULL,
    event_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    capacity INT UNSIGNED NOT NULL,
    publication_status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
    CHECK (capacity > 0),
    CHECK (end_time > start_time),
    INDEX idx_public_events (publication_status, event_date, start_time)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rose_community_leaders (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    referral_code VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(120) NOT NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rose_staff_users (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(254) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('manager', 'nurse', 'volunteer') NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rose_bookings (
    id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    event_id INT UNSIGNED NOT NULL,
    reference VARCHAR(40) NOT NULL UNIQUE,
    access_token_hash CHAR(64) CHARACTER SET ascii COLLATE ascii_bin NULL UNIQUE,
    participant_name VARCHAR(180) NOT NULL,
    phone VARCHAR(50) NULL,
    email VARCHAR(254) NULL,
    leader_id INT UNSIGNED NULL,
    status ENUM('confirmed', 'waiting', 'cancelled') NOT NULL,
    entry_type ENUM('advance', 'walk_in') NOT NULL DEFAULT 'advance',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cancelled_at TIMESTAMP NULL DEFAULT NULL,
    CHECK (COALESCE(CHAR_LENGTH(TRIM(phone)), 0) > 0 OR COALESCE(CHAR_LENGTH(TRIM(email)), 0) > 0),
    FOREIGN KEY (event_id) REFERENCES rose_events(id),
    FOREIGN KEY (leader_id) REFERENCES rose_community_leaders(id),
    INDEX idx_event_bookings (event_id, status, created_at, id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS rose_attendance (
    booking_id INT UNSIGNED NOT NULL PRIMARY KEY,
    staff_id INT UNSIGNED NOT NULL,
    checked_in_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES rose_bookings(id),
    FOREIGN KEY (staff_id) REFERENCES rose_staff_users(id)
) ENGINE=InnoDB;
