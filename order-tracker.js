async function trackOrder() {
  const orderInput = document.getElementById('orderInput');
  const orderId = orderInput.value.trim().toUpperCase();
  const statusDiv = document.getElementById('orderStatus');
  const progressFill = document.getElementById('progressBarFill');

  // Reset UI
  statusDiv.innerHTML = "🔍 Checking order...";
  progressFill.style.width = '0%';

  // Empty input check
  if (orderId === '') {
    statusDiv.innerHTML = '❗ Please enter your order number.';
    return;
  }

  try {
    const response = await fetch('orders.json');
    const orders = await response.json();
    const order = orders.find(o => o.orderId === orderId);

    if (order) {
      // Order found
      statusDiv.innerHTML = `
        ✅ <strong>Order Found:</strong> ${order.title}<br>
        🟢 <strong>Status:</strong> ${order.status}<br>
        📅 <strong>Estimated Delivery:</strong> ${order.estimatedDelivery}
      `;
      progressFill.style.width = order.progress + '%';
    } else {
      // Order not found
      statusDiv.innerHTML = `
        ❌ <strong>Wrong Order Number!</strong><br>
        If you just placed your order, it may take a little time to appear in our system.
      `;
      progressFill.style.width = '0%';
    }
  } catch (error) {
    console.error("Error fetching orders.json:", error);
    statusDiv.innerHTML = '⚠️ Unable to load order data. Please try again later.';
    progressFill.style.width = '0%';
  }
}
