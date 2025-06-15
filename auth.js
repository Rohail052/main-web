// Your Firebase configuration - replace with your config
const firebaseConfig = {
  apiKey: "AIzaSyBgz4GkCfMNzn7_nV4P7yry-MilTDDNbbI",
  authDomain: "login-d7f88.firebaseapp.com",
  projectId: "login-d7f88",
  appId: "1:179833264327:web:f405fc98edf2c2fe4f06e2",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Tabs
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

// Messages
const loginMessage = document.getElementById("loginMessage");
const signupMessage = document.getElementById("signupMessage");

// Inputs
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");

// Google Login button
const googleLogin = document.getElementById("googleLogin");

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

// Clear messages
function clearMessages() {
  loginMessage.textContent = "";
  signupMessage.textContent = "";
}

// Login form submit
loginForm.onsubmit = async (e) => {
  e.preventDefault();
  clearMessages();
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = "dashboard.html";
  } catch (err) {
    loginMessage.textContent = err.message;
    loginMessage.style.color = "salmon";
  }
};

// Signup form submit
signupForm.onsubmit = async (e) => {
  e.preventDefault();
  clearMessages();
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
  }
};

// Google login
googleLogin.onclick = async () => {
  clearMessages();
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
    window.location.href = "dashboard.html";
  } catch (err) {
    loginMessage.textContent = err.message;
    loginMessage.style.color = "salmon";
  }
};
