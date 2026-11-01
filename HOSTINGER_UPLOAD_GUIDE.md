# Complete Guide: How to Upload "Clean Is Clean" Website to Hostinger

---

## 📦 What You Have Ready
Your complete, pre-configured deployment zip file is located at:
`c:\Users\Hp\Downloads\clean-is-clean-hostinger-upload.zip` (17.6 MB)

It includes:
- All website pages (`index.html`, `style.css`, `app.js`, `admin.html`)
- Pre-configured `.htaccess` (Auto HTTPS, video streaming byte-ranges, gzip compression, API routing)
- 3D MP4 video backgrounds (`laundry_video.mp4`, `bubbles_3d.mp4`, `drum_spin_3d.mp4`)
- Both PDF keyword playbooks (`Clean_Is_Clean_100_Plus_Keywords.pdf`, `Clean_Is_Clean_GMB_SEO_Keywords.pdf`)
- PHP API backend (`api/config.php`, `api/bookings.php`, `api/rates.php`, `api/rates.json`)
- Ready MySQL database schema (`database.sql`)

---

## Step 1: Log in to Hostinger hPanel
1. Go to **[https://hpanel.hostinger.com](https://hpanel.hostinger.com)** and log in.
2. In the sidebar or dashboard, click **Websites**, then click **Manage** next to your domain name (e.g. `cleanisclean.com` or your chosen domain).

---

## Step 2: Upload and Extract Files in File Manager
1. In hPanel, search for or click **File Manager** (under Files).
2. Choose **Access files of [your domain]**.
3. Double-click to open the **`public_html`** directory.
   *(Note: If there is a default `default.php` or `index.php` from Hostinger, you can delete it).*
4. In the top-right toolbar, click the **Upload** icon (arrow pointing up) -> select **File**.
5. Select **`clean-is-clean-hostinger-upload.zip`** from your computer's **Downloads** folder.
6. Once uploaded, **Right-Click** on `clean-is-clean-hostinger-upload.zip` -> click **Extract**.
7. In the extract popup, leave the destination folder blank or put `.`, then click **Extract**.
8. Verify that `index.html`, `.htaccess`, `style.css`, `app.js`, `api/`, and `images/` are now inside `public_html`.
   *(You can delete the `.zip` file from `public_html` after extracting to save disk space).*

---

## Step 3: Create a MySQL Database on Hostinger
1. Back in hPanel, look at the left sidebar and click **Databases** -> **MySQL Databases**.
2. Under **Create a New MySQL Database And Database User**, fill in:
   - **MySQL Database name:** e.g. `laundry` (Hostinger will prefix it, e.g. `u123456789_laundry`)
   - **MySQL Username:** e.g. `admin` (Hostinger will prefix it, e.g. `u123456789_admin`)
   - **Password:** Create a strong password (e.g., `CleanIsClean2026#Secure`)
3. Click **Create**.
4. **Copy or write down:**
   - Database Name (e.g. `u123456789_laundry`)
   - Database Username (e.g. `u123456789_admin`)
   - Password you just set

---

## Step 4: Import the Database (`database.sql`)
1. On the same **MySQL Databases** page, scroll down to **List of Current MySQL Databases And Users**.
2. Next to your new database, click **Enter phpMyAdmin**.
3. In phpMyAdmin, click the **Import** tab at the top.
4. Click **Choose File** -> select **`database.sql`** (you can download it from your `public_html` or find it in your local Downloads).
5. Scroll down and click **Import** (or **Go**).
6. You will see a green success message: *Import has been successfully finished, 1 query executed*. The `bookings` table is now live!

---

## Step 5: Connect PHP to Your Database (`api/config.php`)
1. Go back to **File Manager** -> open `public_html/api/config.php`.
2. Right-click `config.php` and click **Edit**.
3. Update lines 6–8 with your actual Hostinger credentials:
   ```php
   $db_host = 'localhost';
   $db_name = 'u123456789_laundry';      // Your Hostinger DB Name from Step 3
   $db_user = 'u123456789_admin';        // Your Hostinger DB User from Step 3
   $db_pass = 'CleanIsClean2026#Secure';  // Your Hostinger DB Password from Step 3
   ```
4. Click **Save** in the top right.

---

## Step 6: Test Your Live Website!
1. Open your browser and visit: **`https://yourdomain.com`**
2. Check:
   - 3D Video background playing and scrubbing on scroll.
   - Rate Card calculator adding up correctly.
   - Booking form: Fill in a test order -> verify that it sends to your WhatsApp and saves to the database.
   - Admin panel: Visit **`https://yourdomain.com/admin.html`** to see orders stored in real-time.
   - Keyword Guide: Click the button in the footer to download `Clean_Is_Clean_100_Plus_Keywords.pdf`.
