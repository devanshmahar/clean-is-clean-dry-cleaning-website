# 🧼 Clean Is Clean — Premium Laundry & Dry Cleaning Website

[![Website](https://img.shields.io/badge/Status-Production%20Ready-0f766e?style=for-the-badge)](https://cleanisclean.com)
[![License](https://img.shields.io/badge/License-MIT-0284c7?style=for-the-badge)](LICENSE)
[![Rating](https://img.shields.io/badge/Google%20Rating-4.9%20★-f59e0b?style=for-the-badge)](#)

> Modern, high-converting laundry and dry cleaning web application with real-time 3D scroll video scrubbing, interactive rate card calculator, GPS-assisted doorstep pickup booking, automated WhatsApp order routing, and PHP/Node.js dual backend.

---

## 🌟 Key Features

- **🎬 3D Hero Video Scroll Engine**: Ultra-smooth frame-by-frame video scrubbing responding to user scroll position with byte-range streaming (`Accept-Ranges: bytes`).
- **💰 Dynamic Rate Card Calculator**: Exact itemized pricing across By-KG Laundry, Men's Wear, Women's Wear, Kids, Household & Bedding, and Specialized Care. Automatic free delivery calculation for orders ₹300+.
- **📍 GPS Doorstep Geolocation**: One-click "Use My Current Location" button capturing GPS coordinates (`latitude`, `longitude`) with direct Google Maps route generation.
- **📱 Instant WhatsApp Order Routing**: Formatted order manifests dispatched directly to the business WhatsApp number with items, quantities, totals, and address links.
- **⭐ Google Reviews Social Proof**: 4.9★ rating showcase featuring verified Google reviews and trust badges.
- **📊 Admin Order Dashboard**: Real-time management interface (`/admin.html`) to track, filter, and update customer order statuses.
- **📄 Dual Backend Ready**:
  - **Node.js**: Instant local execution with HTTP 206 byte-range streaming (`node server.js`).
  - **PHP / MySQL**: Ready for cPanel / Hostinger hPanel shared hosting with PDO database connection.
- **🔍 100+ GMB & Local SEO Playbook**: Embedded JSON-LD `DryCleaningOrLaundry` schema, sitemap, robots.txt, and complete keyword strategy PDF.

---

## 📂 Project Structure

```
├── index.html                           # Main high-converting landing page
├── style.css                            # Sea Green (#0f766e) & Light Blue (#38bdf8) theme
├── app.js                               # 3D scroll scrub, rate calculator & booking logic
├── admin.html                           # Admin order tracking dashboard
├── server.js                            # Node.js backend with HTTP 206 video streaming
├── package.json                         # Node dependencies & start scripts
├── .htaccess                            # Apache / LiteSpeed video streaming & SSL rules
├── database.sql                         # MySQL schema for Hostinger / cPanel
├── Clean_Is_Clean_100_Plus_Keywords.pdf # 125+ Numbered GMB & Local SEO Keywords Guide
├── Clean_Is_Clean_GMB_SEO_Keywords.pdf  # Comprehensive GMB Setup Guide
├── api/
│   ├── config.php                       # Hostinger PDO database connection
│   ├── bookings.php                     # GET / POST endpoints for orders
│   ├── rates.php                        # Rate card JSON provider
│   └── rates.json                       # Service catalog & pricing matrix
├── images/
│   ├── laundry_video.mp4                # Hero 3D washing drum spin video
│   ├── bubbles_3d.mp4                   # 3D floating laundromat bubbles video
│   ├── logo.jpg                         # Official brand logo
│   └── mascot.jpg                       # Clean Is Clean mascot
├── GMB_AND_SEO_PLAYBOOK.md              # Complete Google Local SEO playbook
└── HOSTINGER_UPLOAD_GUIDE.md            # Step-by-step Hostinger deployment guide
```

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js (v18+)

### Running Locally
```bash
# Clone the repository
git clone https://github.com/devanshmahar/clean-is-clean-dry-cleaning-website.git
cd clean-is-clean-dry-cleaning-website

# Start the server
node server.js
```

Open your browser and visit:
- **Website**: [http://localhost:3000](http://localhost:3000)
- **Admin Dashboard**: [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

---

## 🌐 Deploying to Hostinger

1. Compress all files (or use `clean-is-clean-hostinger-upload.zip`).
2. Upload and extract into `public_html/` using Hostinger **File Manager**.
3. Create a MySQL database in **hPanel -> Databases -> MySQL Databases**.
4. Open **phpMyAdmin** and import `database.sql`.
5. Update your database credentials in `api/config.php`:
   ```php
   $db_host = 'localhost';
   $db_name = 'your_hostinger_db_name';
   $db_user = 'your_hostinger_db_user';
   $db_pass = 'your_hostinger_password';
   ```
6. Visit your domain — the site is live! Read `HOSTINGER_UPLOAD_GUIDE.md` for full details.

---

## 📄 License
MIT © 2026 Clean Is Clean.
