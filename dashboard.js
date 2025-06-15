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

// ==== DOM Ready ====
window.onload = () => {
  auth.onAuthStateChanged(user => {
    if (user) {
      document.getElementById("userEmail").textContent = user.email || "User";
      const now = new Date();
      document.getElementById("accessTime").textContent = now.toLocaleTimeString();
    } else {
      location.href = "Newlogin.html";
    }
  });

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      auth.signOut()
        .then(() => location.href = "Newlogin.html")
        .catch(err => alert("Error logging out: " + err.message));
    });
  }
};
