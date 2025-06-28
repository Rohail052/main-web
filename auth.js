// Firebase Config
firebase.initializeApp({
  apiKey: "AIzaSyBgz4GkCfMNzn7_nV4P7yry-MilTDDNbbI",
  authDomain: "login-d7f88.firebaseapp.com",
  projectId: "login-d7f88",
  appId: "1:179833264327:web:f405fc98edf2c2fe4f06e2",
});

const auth = firebase.auth();

// Elements
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const magicTab = document.getElementById("magicTab");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const magicForm = document.getElementById("magicForm");
const loginMessage = document.getElementById("loginMessage");
const signupMessage = document.getElementById("signupMessage");
const magicMessage = document.getElementById("magicMessage");
const spinnerOverlay = document.getElementById("spinnerOverlay");
const resetPassword = document.getElementById("resetPassword");
const googleLogin = document.getElementById("googleLogin");
const googleSignup = document.getElementById("googleSignup");
const rememberMe = document.getElementById("rememberMe");
const loginEmail = document.getElementById("loginEmail");

// Spinner
const showSpinner = () => spinnerOverlay.style.display = "flex";
const hideSpinner = () => spinnerOverlay.style.display = "none";
const clearMessages = () => {
  loginMessage.textContent = "";
  signupMessage.textContent = "";
  magicMessage.textContent = "";
};

// Tabs
function activateTab(tab, form) {
  [loginTab, signupTab, magicTab].forEach(t => t.classList.remove("active"));
  [loginForm, signupForm, magicForm].forEach(f => f.classList.remove("active"));
  tab.classList.add("active");
  form.classList.add("active");
  clearMessages();
}
loginTab.onclick = () => activateTab(loginTab, loginForm);
signupTab.onclick = () => activateTab(signupTab, signupForm);
magicTab.onclick = () => activateTab(magicTab, magicForm);

// Show/hide password
document.querySelectorAll(".toggle-password").forEach(toggle => {
  toggle.onclick = () => {
    const input = document.getElementById(toggle.dataset.target);
    input.type = input.type === "password" ? "text" : "password";
  };
});

// Remember Me
window.onload = () => {
  const savedEmail = localStorage.getItem("rememberedEmail");
  if (savedEmail) {
    loginEmail.value = savedEmail;
    rememberMe.checked = true;
  }
  if (auth.isSignInWithEmailLink(window.location.href)) handleMagicLinkLogin();
};
function rememberEmail() {
  if (rememberMe.checked) {
    localStorage.setItem("rememberedEmail", loginEmail.value);
  } else {
    localStorage.removeItem("rememberedEmail");
  }
}

// Login
loginForm.onsubmit = async (e) => {
  e.preventDefault();
  clearMessages();
  showSpinner();
  try {
    rememberEmail();
    await auth.signInWithEmailAndPassword(
      loginForm.loginEmail.value,
      loginForm.loginPassword.value
    );
    window.location.href = "dashboard.html";
  } catch (err) {
    loginMessage.textContent = err.message;
    loginMessage.style.color = "salmon";
  } finally {
    hideSpinner();
  }
};

// Signup
signupForm.onsubmit = async (e) => {
  e.preventDefault();
  clearMessages();
  showSpinner();
  try {
    await auth.createUserWithEmailAndPassword(
      signupForm.signupEmail.value,
      signupForm.signupPassword.value
    );
    signupMessage.textContent = "Signup successful!";
    signupMessage.style.color = "lightgreen";
  } catch (err) {
    signupMessage.textContent = err.message;
    signupMessage.style.color = "salmon";
  } finally {
    hideSpinner();
  }
};

// Magic link
magicForm.onsubmit = async (e) => {
  e.preventDefault();
  clearMessages();
  showSpinner();
  try {
    const email = magicForm.magicEmail.value.trim();
    await auth.sendSignInLinkToEmail(email, {
      url: window.location.href,
      handleCodeInApp: true,
    });
    localStorage.setItem("emailForSignIn", email);
    magicMessage.textContent = "Magic link sent!";
    magicMessage.style.color = "lightgreen";
  } catch (err) {
    magicMessage.textContent = err.message;
    magicMessage.style.color = "salmon";
  } finally {
    hideSpinner();
  }
};

async function handleMagicLinkLogin() {
  showSpinner();
  try {
    let email = localStorage.getItem("emailForSignIn") || prompt("Enter your email:");
    await auth.signInWithEmailLink(email, window.location.href);
    localStorage.removeItem("emailForSignIn");
    window.location.href = "dashboard.html";
  } catch (err) {
    magicMessage.textContent = err.message;
    magicMessage.style.color = "salmon";
  } finally {
    hideSpinner();
  }
}

// Password Reset
resetPassword.onclick = async () => {
  const email = prompt("Enter your email:");
  if (email) {
    showSpinner();
    try {
      await auth.sendPasswordResetEmail(email.trim());
      loginMessage.textContent = "Reset link sent!";
      loginMessage.style.color = "lightgreen";
    } catch (err) {
      loginMessage.textContent = err.message;
      loginMessage.style.color = "salmon";
    } finally {
      hideSpinner();
    }
  }
};

// Google Auth
const handleGoogle = async (msgEl) => {
  clearMessages();
  showSpinner();
  try {
    await auth.signInWithPopup(new firebase.auth.GoogleAuthProvider());
    window.location.href = "dashboard.html";
  } catch (err) {
    msgEl.textContent = err.message;
    msgEl.style.color = "salmon";
  } finally {
    hideSpinner();
  }
};
googleLogin.onclick = () => handleGoogle(loginMessage);
googleSignup.onclick = () => handleGoogle(signupMessage);
