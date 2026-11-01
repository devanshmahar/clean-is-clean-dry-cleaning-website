-- Clean Is Clean Database Schema for Hostinger MySQL (phpMyAdmin)
CREATE TABLE IF NOT EXISTS `bookings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `booking_code` VARCHAR(20) NOT NULL UNIQUE,
  `customer_name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL,
  `address` TEXT NOT NULL,
  `pincode` VARCHAR(10) DEFAULT '',
  `landmark` VARCHAR(150) DEFAULT '',
  `gps_lat` DECIMAL(10, 8) DEFAULT NULL,
  `gps_lng` DECIMAL(11, 8) DEFAULT NULL,
  `maps_link` VARCHAR(255) DEFAULT '',
  `pickup_date` VARCHAR(20) DEFAULT '',
  `pickup_slot` VARCHAR(50) DEFAULT '',
  `items_json` TEXT NOT NULL,
  `subtotal` DECIMAL(10, 2) NOT NULL,
  `delivery_fee` DECIMAL(10, 2) DEFAULT 0.00,
  `total_amount` DECIMAL(10, 2) NOT NULL,
  `notes` TEXT DEFAULT '',
  `status` VARCHAR(50) DEFAULT 'Pending Pickup',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
