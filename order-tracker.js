document.addEventListener("DOMContentLoaded", () => {
  const orderInput = document.getElementById("orderInput");
  const trackBtn = document.getElementById("trackBtn");
  const statusDiv = document.getElementById("orderStatus");
  const progressFill = document.getElementById("progressBarFill");
  const loadingSpinner = document.getElementById("loadingSpinner");
  const skeleton = document.getElementById("skeletonLoader");

  trackBtn.addEventListener("click", trackOrder);
  orderInput.addEventListener("keyup", (e) => {
    if (e.key === "Enter") trackOrder();
  });

  async function trackOrder() {
    const orderId = orderInput.value.trim();
    if (!orderId) {
      statusDiv.innerHTML = "❗ Please enter your order number.";
      return;
    }

    loadingSpinner.style.display = "block";
    skeleton.style.display = "block";
    trackBtn.classList.add("pulsing");
    statusDiv.innerHTML = `<span class="typing">🔍 Checking order...</span>`;
    progressFill.style.width = "0%";

    try {
      const url = "https://script.google.com/macros/s/AKfycbwNnz_pJjTiE0o-ZbBi5QFwGkHNVHqLpE_gTfTf_zQDAv2-u43jJPQeyejfme0jTAmr2Q/exec?action=getProjects";
      const response = await fetch(url);
      const result = await response.json();

      if (!result.success || !Array.isArray(result.data)) {
        throw new Error("Invalid data received.");
      }

      const orders = result.data;
      const order = orders.find(o => o.ID?.toString() === orderId);

      if (order) {
        const title = order["ProjectName"] || "Untitled";
        const status = order["Status"] || "In Progress";
        const delivery = order["DueDate"] || "N/A";
        const payment = order["PaymentMethod"] || "Pending";
        const customer = order["CustomerName"] || "Unknown";

        statusDiv.innerHTML = `
          ✅ <strong>Order:</strong> ${title}<br>
          🟢 <strong>Status:</strong> ${status}<br>
          💳 <strong>Payment:</strong> ${payment}<br>
          👤 <strong>Customer:</strong> ${customer}<br>
          📅 <strong>Delivery:</strong> ${delivery}
        `;

        const progressPercent =
          status === "Completed" ? 100 :
          status === "In Progress" ? 60 :
          status === "To Do" ? 30 :
          status === "On Hold" ? 10 : 0;

        progressFill.style.width = `${progressPercent}%`;

        if (status === "Completed") {
          confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
        }

        showToast("✅ Order found and loaded", "success");
      } else {
        statusDiv.innerHTML = `
          ❌ <strong>Wrong Order Number!</strong><br>
          It may take time to appear in our system.
        `;
        progressFill.style.width = "0%";
        showToast("Order not found", "error");
      }
    } catch (err) {
      console.error("Error loading order:", err);
      statusDiv.innerHTML = "⚠️ Failed to load order data. Please try again later.";
      showToast("Server error", "error");
    } finally {
      loadingSpinner.style.display = "none";
      skeleton.style.display = "none";
      trackBtn.classList.remove("pulsing");
    }
  }

  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 10);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }
});
