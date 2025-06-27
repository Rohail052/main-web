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

// DOM elements
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const loginMessage = document.getElementById("loginMessage");
const signupMessage = document.getElementById("signupMessage");
const googleLogin = document.getElementById("googleLogin");
const googleSignup = document.getElementById("googleSignup");
const resetPassword = document.getElementById("resetPassword");
const resendVerification = document.getElementById("resendVerification");
const spinnerOverlay = document.getElementById("spinnerOverlay");

let lastLoginUser = null;

function showSpinner() {
  spinnerOverlay.style.display = "flex";
}
function hideSpinner() {
  spinnerOverlay.style.display = "none";
}
function clearMessages() {
  loginMessage.textContent = "";
  signupMessage.textContent = "";
  resendVerification.style.display = "none";
}

// Tab switching
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

// Login
loginForm.onsubmit = async (e) => {
  e.preventDefault();
  clearMessages();
  showSpinner();
  try {
    const { user } = await auth.signInWithEmailAndPassword(
      loginEmail.value.trim(),
      loginPassword.value
    );
    if (user.emailVerified) {
      window.location.href = "dashboard.html";
    } else {
      loginMessage.textContent = "Please verify your email before logging in.";
      loginMessage.style.color = "salmon";
      resendVerification.style.display = "inline";
      lastLoginUser = user;
    }
  } catch (err) {
    loginMessage.textContent = err.message;
    loginMessage.style.color = "salmon";
  } finally {
    hideSpinner();
  }
};

// Resend verification email
resendVerification.onclick = async () => {
  if (lastLoginUser) {
    showSpinner();
    try {
      await lastLoginUser.sendEmailVerification();
      loginMessage.textContent = "Verification email sent again. Check your inbox!";
      loginMessage.style.color = "lightgreen";
      resendVerification.style.display = "none";
    } catch (err) {
      loginMessage.textContent = err.message;
      loginMessage.style.color = "salmon";
    } finally {
      hideSpinner();
    }
  }
};

// Signup
signupForm.onsubmit = async (e) => {
  e.preventDefault();
  clearMessages();
  showSpinner();
  try {
    const { user } = await auth.createUserWithEmailAndPassword(
      signupEmail.value.trim(),
      signupPassword.value
    );
    await user.sendEmailVerification();
    signupMessage.textContent = "Signup successful! Verification email sent.";
    signupMessage.style.color = "lightgreen";
    signupForm.reset();
  } catch (err) {
    signupMessage.textContent = err.message;
    signupMessage.style.color = "salmon";
  } finally {
    hideSpinner();
  }
};

// Google login/signup
async function handleGoogleSignIn(messageEl) {
  clearMessages();
  showSpinner();
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
    window.location.href = "dashboard.html";
  } catch (err) {
    messageEl.textContent = err.message;
    messageEl.style.color = "salmon";
  } finally {
    hideSpinner();
  }
}
googleLogin.onclick = () => handleGoogleSignIn(loginMessage);
googleSignup.onclick = () => handleGoogleSignIn(signupMessage);

// Password reset
resetPassword.onclick = async () => {
  const email = prompt("Enter your email for password reset:");
  if (email) {
    showSpinner();
    try {
      await auth.sendPasswordResetEmail(email.trim());
      loginMessage.textContent = "Password reset email sent!";
      loginMessage.style.color = "lightgreen";
    } catch (err) {
      loginMessage.textContent = err.message;
      loginMessage.style.color = "salmon";
    } finally {
      hideSpinner();
    }
  }
};
