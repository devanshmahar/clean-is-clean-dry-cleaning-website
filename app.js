let allRates = [];
let cart = {}; // key: `${item_id}_${service}` -> { id, name, service, price, unit, qty }
let userGps = null;

// ==========================================
// 3D VIDEO SCROLL-SCRUBBING ENGINE (INSTANT & SMOOTH)
// ==========================================
const heroVideo = document.querySelector('video.bg-video');

if (heroVideo) {
  function updateVideoScrub() {
    if (!heroVideo.duration) return;
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    const heroHeight = window.innerHeight * 1.2;
    const scrollFraction = Math.min(1, Math.max(0, scrollPosition / heroHeight));
    
    // Set video time matching scroll progress
    heroVideo.currentTime = scrollFraction * heroVideo.duration;
  }

  // Ensure metadata is loaded
  heroVideo.addEventListener('loadedmetadata', () => {
    heroVideo.pause();
    updateVideoScrub();
  });

  if (heroVideo.readyState >= 1) {
    heroVideo.pause();
    updateVideoScrub();
  }

  window.addEventListener('scroll', () => {
    requestAnimationFrame(updateVideoScrub);
  }, { passive: true });
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  // Set default pickup date to today
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('pickupDate');
  if (dateInput) {
    dateInput.value = today;
    dateInput.min = today;
  }

  // Load Rates
  try {
    const res = await fetch('/api/rates');
    allRates = await res.json();
    renderCategory('kg');
  } catch (err) {
    console.error('Failed to load rates', err);
  }

  // Category Tab Click
  document.getElementById('categoryTabs').addEventListener('click', (e) => {
    if (e.target.classList.contains('tab-btn')) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      renderCategory(e.target.dataset.cat);
    }
  });

  // Interactive FAQ Accordion
  document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
      const ans = q.nextElementSibling;
      const icon = q.querySelector('i');
      if (ans.style.display === 'none') {
        ans.style.display = 'block';
        icon.className = 'fa-solid fa-chevron-up';
      } else {
        ans.style.display = 'none';
        icon.className = 'fa-solid fa-chevron-down';
      }
    });
  });

  // GPS Geolocation Button
  document.getElementById('btnGetLocation').addEventListener('click', detectGpsLocation);

  // Booking Form Submission
  document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);
});

// Escape HTML to prevent XSS (CodeRabbit Security Rule)
function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Render Rates into Grid
function renderCategory(cat) {
  const grid = document.getElementById('rateGrid');
  const filtered = allRates.filter(item => item.category === cat);

  grid.innerHTML = filtered.map(item => {
    const safeName = escapeHTML(item.name);
    const safeDesc = escapeHTML(item.desc || '');
    const safeUnit = escapeHTML(item.unit || '');

    // Case 1: KG Laundry / Special Service
    if (item.price !== undefined) {
      const key = `${item.id}_standard`;
      const curQty = cart[key]?.qty || 0;
      return `
        <div class="rate-card">
          <div>
            <h4><i class="fa-solid ${item.icon || 'fa-tag'}" style="color:var(--cyan); margin-right:8px;"></i>${safeName}</h4>
            <p style="font-size:0.85rem; color:var(--text-muted);">${safeDesc}</p>
          </div>
          <div class="pricing-options">
            <div class="price-row">
              <span class="price-tag">₹${item.price} <span style="font-size:0.8rem; font-weight:normal; color:var(--text-muted);">${safeUnit}</span></span>
              <div class="qty-control">
                <button type="button" class="qty-btn" aria-label="Decrease quantity" onclick="updateQty('${item.id}', 'standard', -1)">-</button>
                <span id="qty_${key}" style="font-weight:700; width:22px; text-align:center;">${curQty}</span>
                <button type="button" class="qty-btn" aria-label="Increase quantity" onclick="updateQty('${item.id}', 'standard', 1)">+</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    // Case 2: Garment with Dry Cleaning & Steam Ironing options
    const dcKey = `${item.id}_dryclean`;
    const siKey = `${item.id}_steamIron`;
    const curDcQty = cart[dcKey]?.qty || 0;
    const curSiQty = cart[siKey]?.qty || 0;

    return `
      <div class="rate-card">
        <div>
          <h4><i class="fa-solid ${item.icon || 'fa-shirt'}" style="color:var(--cyan); margin-right:8px;"></i>${safeName}</h4>
        </div>
        <div class="pricing-options">
          ${item.dryclean ? `
            <div class="price-row">
              <span>Dry Cleaning: <b style="color:var(--primary);">₹${item.dryclean}</b></span>
              <div class="qty-control">
                <button type="button" class="qty-btn" aria-label="Decrease quantity" onclick="updateQty('${item.id}', 'dryclean', -1)">-</button>
                <span id="qty_${dcKey}" style="font-weight:700; width:22px; text-align:center;">${curDcQty}</span>
                <button type="button" class="qty-btn" aria-label="Increase quantity" onclick="updateQty('${item.id}', 'dryclean', 1)">+</button>
              </div>
            </div>
          ` : ''}
          ${item.steamIron ? `
            <div class="price-row">
              <span>Steam Ironing: <b style="color:var(--primary);">₹${item.steamIron}</b></span>
              <div class="qty-control">
                <button type="button" class="qty-btn" aria-label="Decrease quantity" onclick="updateQty('${item.id}', 'steamIron', -1)">-</button>
                <span id="qty_${siKey}" style="font-weight:700; width:22px; text-align:center;">${curSiQty}</span>
                <button type="button" class="qty-btn" aria-label="Increase quantity" onclick="updateQty('${item.id}', 'steamIron', 1)">+</button>
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

// Update Qty in Cart
function updateQty(itemId, service, change) {
  const item = allRates.find(i => i.id === itemId);
  if (!item) return;

  const key = `${itemId}_${service}`;
  let price = 0;
  let serviceName = 'Standard';
  let unit = item.unit || 'pc';

  if (service === 'standard') {
    price = item.price;
  } else if (service === 'dryclean') {
    price = item.dryclean;
    serviceName = 'Dry Cleaning';
  } else if (service === 'steamIron') {
    price = item.steamIron;
    serviceName = 'Steam Ironing';
  }

  const existing = cart[key]?.qty || 0;
  const newQty = Math.max(0, existing + change);

  if (newQty === 0) {
    delete cart[key];
  } else {
    cart[key] = {
      id: itemId,
      name: item.name,
      service: serviceName,
      price: price,
      unit: unit,
      qty: newQty
    };
  }

  // Update card UI if present
  const span = document.getElementById(`qty_${key}`);
  if (span) span.innerText = newQty;

  renderCartSummary();
}

// Render Cart & Totals
function renderCartSummary() {
  const container = document.getElementById('cartItemsList');
  const items = Object.values(cart);

  if (items.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding:30px 0;">No items added yet.<br>Pick services from the rate card or book directly.</p>`;
    document.getElementById('sumSubtotal').innerText = '₹0';
    document.getElementById('sumTotal').innerText = '₹0';
    document.getElementById('stickyTotal').innerText = '₹0';
    return;
  }

  let subtotal = 0;
  container.innerHTML = items.map(i => {
    const itemTotal = i.qty * i.price;
    subtotal += itemTotal;
    return `
      <div class="cart-item">
        <span>${i.name} <small style="color:var(--text-muted);">(${i.service})</small> × ${i.qty}</span>
        <span style="font-weight:700;">₹${itemTotal}</span>
      </div>
    `;
  }).join('');

  const deliveryFee = (subtotal >= 300 || subtotal === 0) ? 0 : 50;
  const grandTotal = subtotal + deliveryFee;

  document.getElementById('sumSubtotal').innerText = `₹${subtotal}`;
  document.getElementById('sumDelivery').innerHTML = deliveryFee === 0 
    ? `<span class="free-tag">FREE (Orders ₹300+)</span>`
    : `₹${deliveryFee}`;
  document.getElementById('sumTotal').innerText = `₹${grandTotal}`;
  document.getElementById('stickyTotal').innerText = `₹${grandTotal}`;
}

// Detect GPS Location
function detectGpsLocation() {
  const status = document.getElementById('gpsStatus');
  const btn = document.getElementById('btnGetLocation');

  if (!navigator.geolocation) {
    status.innerText = 'Geolocation is not supported by your browser.';
    return;
  }

  status.innerText = 'Locating...';
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      userGps = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude
      };
      status.innerText = `✓ GPS Captured (${userGps.lat.toFixed(4)}, ${userGps.lng.toFixed(4)})`;
      btn.classList.add('gps-detected');
      btn.innerHTML = `<i class="fa-solid fa-check"></i> GPS Location Attached`;
    },
    (err) => {
      console.warn('GPS error', err);
      status.innerText = 'Could not access GPS. Please ensure address is typed fully.';
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
}

// Handle Booking Form Submit
async function handleBookingSubmit(e) {
  e.preventDefault();

  const btn = document.getElementById('btnSubmitOrder');
  btn.disabled = true;
  btn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving Booking...`;

  const items = Object.values(cart);
  let subtotal = items.reduce((acc, i) => acc + (i.qty * i.price), 0);
  const deliveryFee = (subtotal >= 300 || subtotal === 0) ? 0 : 50;
  const grandTotal = subtotal + deliveryFee;

  const payload = {
    customer_name: document.getElementById('custName').value,
    phone: document.getElementById('custPhone').value,
    address: document.getElementById('custAddress').value,
    pincode: document.getElementById('custPincode').value,
    landmark: document.getElementById('custLandmark').value,
    gps_lat: userGps ? userGps.lat : null,
    gps_lng: userGps ? userGps.lng : null,
    pickup_date: document.getElementById('pickupDate').value,
    pickup_slot: document.getElementById('pickupSlot').value,
    notes: document.getElementById('orderNotes').value,
    items: items,
    subtotal: subtotal,
    delivery_fee: deliveryFee,
    total_amount: grandTotal
  };

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await res.json();
    if (!result.success) {
      alert('Error: ' + (result.error || 'Failed to submit'));
      btn.disabled = false;
      btn.innerHTML = `<i class="fa-brands fa-whatsapp"></i> Confirm & Send Order to WhatsApp`;
      return;
    }

    // Success: Open WhatsApp with pre-filled order
    const businessPhone = document.getElementById('businessPhone').value.replace(/[^0-9]/g, '');
    let targetWaUrl = `https://api.whatsapp.com/send?phone=${businessPhone}&text=${encodeURIComponent(result.whatsapp_message)}`;

    // Fallback if no phone specified
    if (!businessPhone) {
      targetWaUrl = result.whatsapp_url;
    }

    alert(`🎉 Booking Saved to Database!\nBooking Code: ${result.booking_code}\n\nRedirecting to WhatsApp to send order details...`);
    window.location.href = targetWaUrl;

  } catch (err) {
    console.error('Submission failed', err);
    alert('Failed to connect to server. Please try again.');
    btn.disabled = false;
    btn.innerHTML = `<i class="fa-brands fa-whatsapp"></i> Confirm & Send Order to WhatsApp`;
  }
}
