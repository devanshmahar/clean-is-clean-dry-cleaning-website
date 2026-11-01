<?php
require_once __DIR__ . '/config.php';

$method = $_SERVER['REQUEST_METHOD'];

// GET: Retrieve bookings for admin dashboard
if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM bookings ORDER BY id DESC LIMIT 100");
        $bookings = $stmt->fetchAll();
        echo json_encode([
            'success' => true,
            'count' => count($bookings),
            'bookings' => $bookings
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => $e->getMessage()]);
    }
    exit;
}

// POST: Save a new customer booking
if ($method === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON payload']);
        exit;
    }

    $customer_name = trim($data['customer_name'] ?? '');
    $phone         = trim($data['phone'] ?? '');
    $address       = trim($data['address'] ?? '');
    $pincode       = trim($data['pincode'] ?? '');
    $landmark      = trim($data['landmark'] ?? '');
    $gps_lat       = isset($data['gps_lat']) && $data['gps_lat'] !== '' ? floatval($data['gps_lat']) : null;
    $gps_lng       = isset($data['gps_lng']) && $data['gps_lng'] !== '' ? floatval($data['gps_lng']) : null;
    $pickup_date   = trim($data['pickup_date'] ?? '');
    $pickup_slot   = trim($data['pickup_slot'] ?? '');
    $items         = $data['items'] ?? [];
    $subtotal      = floatval($data['subtotal'] ?? 0);
    $delivery_fee  = floatval($data['delivery_fee'] ?? 0);
    $total_amount  = floatval($data['total_amount'] ?? 0);
    $notes         = trim($data['notes'] ?? '');

    if (empty($customer_name) || empty($phone) || empty($address)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields (Name, Phone, Address)']);
        exit;
    }

    $booking_code = 'CIC-' . rand(100000, 900000);

    if ($gps_lat && $gps_lng) {
        $maps_link = "https://www.google.com/maps?q={$gps_lat},{$gps_lng}";
    } else {
        $maps_link = "https://www.google.com/maps/search/?api=1&query=" . urlencode($address . ($pincode ? " $pincode" : ''));
    }

    try {
        $sql = "INSERT INTO bookings (
            booking_code, customer_name, phone, address, pincode, landmark,
            gps_lat, gps_lng, maps_link, pickup_date, pickup_slot,
            items_json, subtotal, delivery_fee, total_amount, notes
        ) VALUES (
            :booking_code, :customer_name, :phone, :address, :pincode, :landmark,
            :gps_lat, :gps_lng, :maps_link, :pickup_date, :pickup_slot,
            :items_json, :subtotal, :delivery_fee, :total_amount, :notes
        )";

        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':booking_code' => $booking_code,
            ':customer_name' => $customer_name,
            ':phone' => $phone,
            ':address' => $address,
            ':pincode' => $pincode,
            ':landmark' => $landmark,
            ':gps_lat' => $gps_lat,
            ':gps_lng' => $gps_lng,
            ':maps_link' => $maps_link,
            ':pickup_date' => $pickup_date,
            ':pickup_slot' => $pickup_slot,
            ':items_json' => json_encode($items),
            ':subtotal' => $subtotal,
            ':delivery_fee' => $delivery_fee,
            ':total_amount' => $total_amount,
            ':notes' => $notes
        ]);

        // Build WhatsApp text
        $itemsList = '';
        foreach ($items as $item) {
            $serv = $item['service'] ?? 'Standard';
            $unit = $item['unit'] ?? 'pc';
            $lineTotal = $item['qty'] * $item['price'];
            $itemsList .= "• {$item['name']} ({$serv}): {$item['qty']} {$unit} × ₹{$item['price']} = ₹{$lineTotal}\n";
        }
        if (empty($itemsList)) {
            $itemsList = "Custom estimate at doorstep pickup\n";
        }

        $waText  = "🧼 *NEW BOOKING — CLEAN IS CLEAN*\n";
        $waText .= "━━━━━━━━━━━━━━━━━━━━━\n";
        $waText .= "🔖 *Booking ID:* {$booking_code}\n";
        $waText .= "👤 *Customer:* {$customer_name}\n";
        $waText .= "📞 *Phone:* {$phone}\n";
        $waText .= "📍 *Address:* {$address}\n";
        if (!empty($landmark)) $waText .= "🏢 *Landmark:* {$landmark}\n";
        if (!empty($pincode))  $waText .= "📮 *Pincode:* {$pincode}\n";
        if (!empty($maps_link)) $waText .= "🗺️ *Live Location / Maps:* {$maps_link}\n";
        $waText .= "📅 *Pickup:* {$pickup_date} ({$pickup_slot})\n";
        $waText .= "━━━━━━━━━━━━━━━━━━━━━\n";
        $waText .= "🧺 *Items Booked:*\n{$itemsList}";
        $waText .= "━━━━━━━━━━━━━━━━━━━━━\n";
        $waText .= "💰 *Subtotal:* ₹{$subtotal}\n";
        $waText .= "🚚 *Delivery:* " . ($delivery_fee == 0 ? "FREE (Orders ₹300+)" : "₹{$delivery_fee}") . "\n";
        $waText .= "💵 *TOTAL ESTIMATED:* *₹{$total_amount}*\n";
        if (!empty($notes)) $waText .= "📝 *Notes:* {$notes}\n";
        $waText .= "━━━━━━━━━━━━━━━━━━━━━\n";
        $waText .= "_Confirmation generated by Clean Is Clean System_";

        http_response_code(201);
        echo json_encode([
            'success' => true,
            'booking_code' => $booking_code,
            'maps_link' => $maps_link,
            'total_amount' => $total_amount,
            'whatsapp_message' => $waText,
            'whatsapp_url' => 'https://api.whatsapp.com/send?text=' . urlencode($waText)
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
    }
    exit;
}
