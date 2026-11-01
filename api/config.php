<?php
// Hostinger MySQL Database Configuration
// Replace these with the credentials you create in Hostinger hPanel -> Databases -> MySQL Databases

$db_host = 'localhost'; // Usually 'localhost' on Hostinger
$db_name = 'u123456789_cleanisclean'; // Your Hostinger Database Name
$db_user = 'u123456789_cic_admin';    // Your Hostinger Database Username
$db_pass = 'YourStrongPassword123#';   // Your Hostinger Database Password

// Set response header to JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database connection failed. Please verify credentials in api/config.php',
        'details' => $e->getMessage()
    ]);
    exit;
}
