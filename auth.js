const firebaseConfig = {
  apiKey: "AIzaSyBgz4GkCfMNzn7_nV4P7yry-MilTDDNbbI",
  authDomain: "login-d7f88.firebaseapp.com",
  projectId: "login-d7f88",
  appId: "1:179833264327:web:f405fc98edf2c2fe4f06e2",
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

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

function showSpinner() { spinnerOverlay.style.display = "flex"; }
function hideSpinner() { spinnerOverlay.style.display = "none"; }
function clearMessages() {
  loginMessage.textContent = "";
  signupMessage.textContent = "";
  magicMessage.textContent = "";
}

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

// Login
loginForm.onsubmit = async (e) => {
  e.preventDefault();
  clearMessages();
  showSpinner();
  try {
    const { user } = await auth.signInWithEmailAndPassword(
      loginForm.loginEmail.value,
      loginForm.loginPassword.value
    );
    if (user.emailVerified) {
      window.location.href = "dashboard.html";
    } else {
      loginMessage.textContent = "Please verify your email before logging in.";
      loginMessage.style.color = "salmon";
    }
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
    const { user } = await auth.createUserWithEmailAndPassword(
      signupForm.signupEmail.value,
      signupForm.signupPassword.value
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

// Magic link
magicForm.onsubmit = async (e) => {
  e.preventDefault();
  clearMessages();
  showSpinner();
  const email = magicForm.magicEmail.value.trim();
  const settings = {
    url: window.location.href,
    handleCodeInApp: true,
  };
  try {
    await auth.sendSignInLinkToEmail(email, settings);
    window.localStorage.setItem("emailForSignIn", email);
    magicMessage.textContent = "Magic link sent! Check your email.";
    magicMessage.style.color = "lightgreen";
  } catch (err) {
    magicMessage.textContent = err.message;
    magicMessage.style.color = "salmon";
  } finally {
    hideSpinner();
  }
};

// Handle magic link return
window.onload = async () => {
  if (auth.isSignInWithEmailLink(window.location.href)) {
    showSpinner();
    try {
      let email = localStorage.getItem("emailForSignIn");
      if (!email) {
        email = prompt("Enter your email for confirmation");
      }
      await auth.signInWithEmailLink(email, window.location.href);
      magicMessage.textContent = "Signed in successfully!";
      magicMessage.style.color = "lightgreen";
      localStorage.removeItem("emailForSignIn");
      window.location.href = "dashboard.html";
    } catch (err) {
      magicMessage.textContent = err.message;
      magicMessage.style.color = "salmon";
    } finally {
      hideSpinner();
    }
  }
};

// Reset password
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

// Google login/signup
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
