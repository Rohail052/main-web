// order.js

const API_URL = 'https://script.google.com/macros/s/AKfycbwNnz_pJjTiE0o-ZbBi5QFwGkHNVHqLpE_gTfTf_zQDAv2-u43jJPQeyejfme0jTAmr2Q/exec';

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerText = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

async function trackOrder() {
  const orderInput = document.getElementById('orderInput');
  const orderId = orderInput.value.trim().toUpperCase();
  const statusDiv = document.getElementById('orderStatus');
  const progressFill = document.getElementById('progressBarFill');

  statusDiv.innerHTML = '🔍 Checking order...';
  progressFill.style.width = '0%';

  if (!orderId) {
    statusDiv.innerHTML = '❗ Please enter your order number.';
    return;
  }

  try {
    const response = await fetch(`${API_URL}?orderId=${orderId}`);
    const result = await response.json();

    if (result && result.success && result.data) {
      const order = result.data;
      statusDiv.innerHTML = `
        ✅ <strong>Order Found:</strong> ${order.title}<br>
        🟢 <strong>Status:</strong> ${order.status}<br>
        📅 <strong>Estimated Delivery:</strong> ${order.estimatedDelivery}
      `;
      progressFill.style.width = `${order.progress}%`;
      showToast('Order found and loaded successfully!', 'success');
    } else {
      statusDiv.innerHTML = `
        ❌ <strong>Wrong Order Number!</strong><br>
        If you just placed your order, it may take a little time to appear in our system.
      `;
      showToast('Order not found. Please check again.', 'error');
    }
  } catch (error) {
    console.error('Error fetching order:', error);
    statusDiv.innerHTML = '⚠️ Unable to load order data. Please try again later.';
    showToast('Failed to load order data.', 'error');
  }
}
