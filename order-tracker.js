const APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwNnz_pJjTiE0o-ZbBi5QFwGkHNVHqLpE_gTfTf_zQDAv2-u43jJPQeyejfme0jTAmr2Q/exec';

const orderInput = document.getElementById('orderInput');
const statusDiv = document.getElementById('orderStatus');
const progressFill = document.getElementById('progressBarFill');
const trackButton = document.querySelector('.track-btn');

let refreshInterval = null;

function showLoadingSpinner() {
  statusDiv.innerHTML = `<div class="spinner" aria-label="Loading"></div> Checking order...`;
  progressFill.style.width = '0%';
}

function showOrderDetails(order) {
  statusDiv.innerHTML = `
    ✅ <strong>Order Found:</strong> ${order.title}<br>
    🟢 <strong>Status:</strong> ${order.status}<br>
    📅 <strong>Estimated Delivery:</strong> ${order.estimatedDelivery}
  `;
  progressFill.style.width = order.progress + '%';
}

function showOrderNotFound() {
  statusDiv.innerHTML = `
    ❌ <strong>Wrong Order Number!</strong><br>
    If you just placed your order, it may take a little time to appear in our system.
  `;
  progressFill.style.width = '0%';
}

function showError() {
  statusDiv.innerHTML = '⚠️ Unable to load order data. Please try again later.';
  progressFill.style.width = '0%';
}

async function fetchOrder(orderId) {
  try {
    const url = `${APPS_SCRIPT_WEB_APP_URL}?action=getOrders`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();

    if (data.success && Array.isArray(data.data)) {
      const orders = data.data;
      const order = orders.find(o => o.orderId.toUpperCase() === orderId);
      return order || null;
    } else {
      console.error('Error from Apps Script:', data.message || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}

async function trackOrder() {
  const orderId = orderInput.value.trim().toUpperCase();
  if (!orderId) {
    statusDiv.innerHTML = '❗ Please enter your order number.';
    progressFill.style.width = '0%';
    return;
  }

  showLoadingSpinner();

  const order = await fetchOrder(orderId);
  if (order) {
    showOrderDetails(order);
  } else {
    showOrderNotFound();
  }
}

function startAutoRefresh() {
  // Clear any existing interval
  if (refreshInterval) clearInterval(refreshInterval);

  // Refresh every 30 seconds if input is not empty
  refreshInterval = setInterval(() => {
    if (orderInput.value.trim()) {
      trackOrder();
    }
  }, 30000); // 30,000 ms = 30 seconds
}

// Event Listeners
trackButton.addEventListener('click', () => {
  trackOrder();
  startAutoRefresh();
});

// Optional: trigger tracking on Enter key press inside input
orderInput.addEventListener('keyup', (e) => {
  if (e.key === 'Enter') {
    trackOrder();
    startAutoRefresh();
  }
});
