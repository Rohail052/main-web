// ==== Firebase Setup ====
const firebaseConfig = {
  apiKey: "AIzaSyBgz4GkCfMNzn7_nV4P7yry-MilTDDNbbI",
  authDomain: "login-d7f88.firebaseapp.com",
  projectId: "login-d7f88",
  appId: "1:179833264327:web:f405fc98edf2c2fe4f06e2",
};
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

const AUTO_LOGOUT_MINUTES = 30;
let logoutTimer;

// Wait for DOM and Firebase auth ready
window.onload = () => {
  document.body.classList.add("loaded");

  checkIncognitoMode();
  setGreetingMessage();

  auth.onAuthStateChanged(user => {
    if (!user) {
      location.href = "Newlogin.html";
      return;
    }
    document.getElementById("userEmail").textContent = user.email || "User";

    logActivity("Logged in");

    fetchRecentLogs(user.email);

    setupLogoutTimer();

    setupEventListeners();
  });
};

// --- Setup inactivity auto logout ---
function setupLogoutTimer() {
  resetLogoutTimer();
  ['mousemove', 'keydown', 'scroll', 'click'].forEach(evt => {
    window.addEventListener(evt, resetLogoutTimer);
  });
}

function resetLogoutTimer() {
  clearTimeout(logoutTimer);
  logoutTimer = setTimeout(() => {
    alert("Session expired due to inactivity. Logging out.");
    logoutUser();
  }, AUTO_LOGOUT_MINUTES * 60 * 1000);
}

function logoutUser() {
  auth.signOut().then(() => {
    location.href = "Newlogin.html";
  });
}

// --- Activity Logging ---
function logActivity(action) {
  const user = auth.currentUser;
  if (!user) return;
  db.collection("activityLogs").add({
    email: user.email,
    action,
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

// --- Fetch & show recent activity logs ---
function fetchRecentLogs(email) {
  db.collection("activityLogs")
    .where("email", "==", email)
    .orderBy("timestamp", "desc")
    .limit(10)
    .get()
    .then(snapshot => {
      const table = document.getElementById("logTableBody");
      table.innerHTML = "";
      snapshot.forEach(doc => {
        const data = doc.data();
        const time = data.timestamp ? data.timestamp.toDate().toLocaleString() : "Pending...";
        const row = `<tr><td>${escapeHtml(data.action)}</td><td>${time}</td></tr>`;
        table.innerHTML += row;
      });
    })
    .catch(console.error);
}

// --- Simple escaping for HTML to avoid injection ---
function escapeHtml(text) {
  const map = {
    '&': "&amp;",
    '<': "&lt;",
    '>': "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// --- Setup UI event listeners ---
function setupEventListeners() {
  // Logout button
  document.getElementById("logoutBtn").addEventListener("click", () => {
    logActivity("Logged out");
    logoutUser();
  });

  // Cards clicks (except settings card)
  document.querySelectorAll(".card").forEach(card => {
    if (card.id === "settingsCard") return;
    card.addEventListener("click", () => {
      const section = card.dataset.section || "Unknown Section";
      logActivity(`Clicked: ${section}`);
      alert(`Opening "${section}"...`);
    });
  });

  // Settings card click
  document.getElementById("settingsCard").addEventListener("click", () => {
    openSettingsTab();
    logActivity("Opened Settings Tab");
  });

  // Settings update button
  document.getElementById("updateSettingsBtn").addEventListener("click", () => {
    updateUserSettings();
  });

  // Chat button
  document.getElementById("chatBtn").addEventListener("click", () => {
    window.open("https://m.me/yourpageusername", "_blank");
  });
}

// --- Open Settings UI ---
function openSettingsTab() {
  document.getElementById("settingsTab").style.display = "block";
}

// --- Update username & password ---
function updateUserSettings() {
  const user = auth.currentUser;
  if (!user) return alert("User not logged in.");

  const newName = document.getElementById("newUsername").value.trim();
  const newPass = document.getElementById("newPassword").value.trim();

  if (!newName && !newPass) return alert("Please enter a new username or password.");

  const promises = [];

  if (newName) {
    promises.push(
      user.updateProfile({ displayName: newName })
        .then(() => alert("✅ Username updated."))
        .catch(err => alert("❌ Username update failed: " + err.message))
    );
  }

  if (newPass) {
    promises.push(
      user.updatePassword(newPass)
        .then(() => alert("✅ Password updated."))
        .catch(err => alert("❌ Password update failed: " + err.message))
    );
  }

  Promise.all(promises).then(() => {
    logActivity("Updated profile settings");
    // Clear inputs
    document.getElementById("newUsername").value = "";
    document.getElementById("newPassword").value = "";
  });
}

// --- Greeting message ---
function setGreetingMessage() {
  const greetings = [
    "Welcome back! 🔥",
    "Stay focused today. 🚀",
    "You’re doing amazing! 💪",
    "Ready to crush your goals? 🎯",
    "Believe in yourself! ✨",
  ];
  const msg = greetings[Math.floor(Math.random() * greetings.length)];
  document.getElementById("greetingMessage").textContent = msg;
}

// --- Incognito detection ---
function checkIncognitoMode() {
  const fs = window.RequestFileSystem || window.webkitRequestFileSystem;
  if (!fs) return;

  fs(window.TEMPORARY, 100, () => {}, () => {
    alert("🕵️ You're browsing in Incognito Mode. Some features may not work properly.");
  });
}
