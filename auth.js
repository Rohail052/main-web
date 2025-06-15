// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgz4GkCfMNzn7_nV4P7yry-MilTDDNbbI",
  authDomain: "login-d7f88.firebaseapp.com",
  projectId: "login-d7f88",
  appId: "1:179833264327:web:f405fc98edf2c2fe4f06e2",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM Elements
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const loginMessage = document.getElementById("loginMessage");
const signupMessage = document.getElementById("signupMessage");

const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");

const googleLogin = document.getElementById("googleLogin");
const googleSignup = document.getElementById("googleSignup");

const spinnerOverlay = document.getElementById("spinnerOverlay");

// Utility: Spinner control
function showSpinner() {
  spinnerOverlay.style.display = "flex";
}
function hideSpinner() {
  spinnerOverlay.style.display = "none";
}

// Utility: Clear messages
function clearMessages() {
  loginMessage.textContent = "";
  signupMessage.textContent = "";
}

// Switch tabs
loginTab.onclick = () => {
  loginTab.classList.add("active");
  signupTab.classList.remove("active");
  loginForm.classList.add("active");
  signupForm.classList.remove("active");
  clearMessages();
};

signupTab.onclick = () => {
  signupTab.classList.add("active");
  loginTab.classList.remove("active");
  signupForm.classList.add("active");
  loginForm.classList.remove("active");
  clearMessages();
};

// Login with email/password
loginForm.onsubmit = async (e) => {
  e.preventDefault();
  clearMessages();
  showSpinner();

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = "dashboard.html";
  } catch (err) {
    loginMessage.textContent = err.message;
    loginMessage.style.color = "salmon";
  } finally {
    hideSpinner();
  }
};

// Signup with email/password
signupForm.onsubmit = async (e) => {
  e.preventDefault();
  clearMessages();
  showSpinner();

  const email = signupEmail.value.trim();
  const password = signupPassword.value;

  try {
    await auth.createUserWithEmailAndPassword(email, password);
    signupMessage.textContent = "Signup successful! You can now log in.";
    signupMessage.style.color = "lightgreen";
    signupForm.reset();
  } catch (err) {
    signupMessage.textContent = err.message;
    signupMessage.style.color = "salmon";
  } finally {
    hideSpinner();
  }
};

// Google login
googleLogin.onclick = async () => {
  clearMessages();
  showSpinner();

  const provider = new firebase.auth.GoogleAuthProvider();

  try {
    await auth.signInWithPopup(provider);
    window.location.href = "dashboard.html";
  } catch (err) {
    loginMessage.textContent = err.message;
    loginMessage.style.color = "salmon";
  } finally {
    hideSpinner();
  }
};

// Google signup
googleSignup.onclick = async () => {
  clearMessages();
  showSpinner();

  const provider = new firebase.auth.GoogleAuthProvider();

  try {
    await auth.signInWithPopup(provider);
    window.location.href = "dashboard.html";
  } catch (err) {
    signupMessage.textContent = err.message;
    signupMessage.style.color = "salmon";
  } finally {
    hideSpinner();
  }
};
