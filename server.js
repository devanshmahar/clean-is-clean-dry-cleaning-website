const http = require('http');
const fs = require('fs');
const path = require('path');
const sqlite3 = require('node:sqlite');

const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'data', 'clean_is_clean.db');
const RATES_FILE = path.join(__dirname, 'data', 'rates.json');
const PUBLIC_DIR = path.join(__dirname, 'public');

// Initialize Built-in SQLite Database
const db = new sqlite3.DatabaseSync(DB_FILE);
db.exec(`
  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_code TEXT UNIQUE,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    pincode TEXT,
    landmark TEXT,
    gps_lat REAL,
    gps_lng REAL,
    maps_link TEXT,
    pickup_date TEXT,
    pickup_slot TEXT,
    items_json TEXT NOT NULL,
    subtotal REAL NOT NULL,
    delivery_fee REAL DEFAULT 0,
    total_amount REAL NOT NULL,
    notes TEXT,
    status TEXT DEFAULT 'Pending Pickup',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

function serveStatic(req, res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }

    const range = req.headers.range;
    const fileSize = stats.size;

    // HTTP 206 Partial Content for instant video seeking and scrubbing
    if (range && (ext === '.mp4' || ext === '.webm')) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      const file = fs.createReadStream(filePath, { start, end });

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
      });
      file.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Accept-Ranges': 'bytes',
        'Content-Type': contentType
      });
      fs.createReadStream(filePath).pipe(res);
    }
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
  const pathname = parsedUrl.pathname;

  // CORS headers for APIs
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API 1: Get Rate Card
  if (pathname === '/api/rates' && req.method === 'GET') {
    fs.readFile(RATES_FILE, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Failed to read rates' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(data);
    });
    return;
  }

  // API 2: Create Booking (Save to SQLite Database)
  if (pathname === '/api/bookings' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        const {
          customer_name,
          phone,
          address,
          pincode,
          landmark,
          gps_lat,
          gps_lng,
          pickup_date,
          pickup_slot,
          items,
          subtotal,
          delivery_fee,
          total_amount,
          notes
        } = payload;

        if (!customer_name || !phone || !address) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Missing required fields (Name, Phone, Address)' }));
          return;
        }

        const booking_code = 'CIC-' + Math.floor(100000 + Math.random() * 900000);
        const maps_link = (gps_lat && gps_lng)
          ? `https://www.google.com/maps?q=${gps_lat},${gps_lng}`
          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address + (pincode ? ' ' + pincode : ''))}`;

        const insertStmt = db.prepare(`
          INSERT INTO bookings (
            booking_code, customer_name, phone, address, pincode, landmark,
            gps_lat, gps_lng, maps_link, pickup_date, pickup_slot,
            items_json, subtotal, delivery_fee, total_amount, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        insertStmt.run(
          booking_code,
          customer_name.trim(),
          phone.trim(),
          address.trim(),
          pincode || '',
          landmark || '',
          gps_lat || null,
          gps_lng || null,
          maps_link,
          pickup_date || '',
          pickup_slot || '',
          JSON.stringify(items || []),
          Number(subtotal) || 0,
          Number(delivery_fee) || 0,
          Number(total_amount) || 0,
          notes || ''
        );

        // Build WhatsApp notification text
        const itemsList = (items || []).map(i => `• ${i.name} (${i.service || 'Laundry'}): ${i.qty} ${i.unit || 'pc'} × ₹${i.price} = ₹${i.qty * i.price}`).join('\n');
        
        let waText = `🧼 *NEW BOOKING — CLEAN IS CLEAN*\n`;
        waText += `━━━━━━━━━━━━━━━━━━━━━\n`;
        waText += `🔖 *Booking ID:* ${booking_code}\n`;
        waText += `👤 *Customer:* ${customer_name}\n`;
        waText += `📞 *Phone:* ${phone}\n`;
        waText += `📍 *Address:* ${address}\n`;
        if (landmark) waText += `🏢 *Landmark:* ${landmark}\n`;
        if (pincode) waText += `📮 *Pincode:* ${pincode}\n`;
        if (maps_link) waText += `🗺️ *Live Location / Maps:* ${maps_link}\n`;
        waText += `📅 *Pickup:* ${pickup_date || 'Earliest Slot'} (${pickup_slot || 'Anytime'})\n`;
        waText += `━━━━━━━━━━━━━━━━━━━━━\n`;
        waText += `🧺 *Items Booked:*\n${itemsList || 'Custom estimate upon pickup'}\n`;
        waText += `━━━━━━━━━━━━━━━━━━━━━\n`;
        waText += `💰 *Subtotal:* ₹${subtotal}\n`;
        waText += `🚚 *Delivery:* ${delivery_fee === 0 ? 'FREE (Orders ₹300+)' : '₹' + delivery_fee}\n`;
        waText += `💵 *TOTAL ESTIMATED:* *₹${total_amount}*\n`;
        if (notes) waText += `📝 *Notes:* ${notes}\n`;
        waText += `━━━━━━━━━━━━━━━━━━━━━\n`;
        waText += `_Confirmation generated by Clean Is Clean System_`;

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          booking_code,
          maps_link,
          total_amount,
          whatsapp_message: waText,
          whatsapp_url: `https://api.whatsapp.com/send?text=${encodeURIComponent(waText)}`
        }));
      } catch (err) {
        console.error('Booking save error:', err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error saving booking', details: err.message }));
      }
    });
    return;
  }

  // API 3: Admin List Bookings (View Database)
  if (pathname === '/api/bookings' && req.method === 'GET') {
    try {
      const rows = db.prepare(`SELECT * FROM bookings ORDER BY id DESC LIMIT 100`).all();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count: rows.length, bookings: rows }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: err.message }));
    }
    return;
  }

  // Static File Serving
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      filePath = path.join(PUBLIC_DIR, 'index.html');
    }
    serveStatic(req, res, filePath);
  });
});

server.listen(PORT, () => {
  console.log(`Clean Is Clean server running at http://localhost:${PORT}`);
});
