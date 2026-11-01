<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$ratesFile = __DIR__ . '/rates.json';
if (file_exists($ratesFile)) {
    readfile($ratesFile);
} else {
    http_response_code(404);
    echo json_encode(['error' => 'rates.json not found']);
}
