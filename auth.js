// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBgz4GkCfMNzn7_nV4P7yry-MilTDDNbbI",
  authDomain: "login-d7f88.firebaseapp.com",
  projectId: "login-d7f88",
  appId: "1:179833264327:web:f405fc98edf2c2fe4f06e2",
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM Elements
const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");
const magicTab = document.getElementById("magicTab");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const magicForm = document.getElementById("magicForm");
const twoFactorForm = document.getElementById("twoFactorForm");

const loginMessage = document.getElementById("loginMessage");
const signupMessage = document.getElementById("signupMessage");
const magicMessage = document.getElementById("magicMessage");
const twoFactorMessage = document.getElementById("twoFactorMessage");

const spinnerOverlay = document.getElementById("spinnerOverlay");
const resetPassword = document.getElementById("resetPassword");
const googleLogin = document.getElementById("googleLogin");
const googleSignup = document.getElementById("googleSignup");
const rememberMeCheckbox = document.getElementById("rememberMe");

const loginEmailInput = document.getElementById("loginEmail");
const loginPasswordInput = document.getElementById("loginPassword");

const sendCodeBtn = document.getElementById("sendCodeBtn");
const verifyCodeBtn = document.getElementById("verifyCodeBtn");
const phoneNumberInput = document.getElementById("phoneNumber");
const verificationCodeInput = document.getElementById("verificationCode");

const tabs = [loginTab, signupTab, magicTab];
const forms = [loginForm, signupForm, magicForm, twoFactorForm];

function showSpinner() { spinnerOverlay.style.display = "flex"; }
function hideSpinner() { spinnerOverlay.style.display = "none"; }
function clearMessages() {
  loginMessage.textContent = "";
  signupMessage.textContent = "";
  magicMessage.textContent = "";
  twoFactorMessage.textContent = "";
}
function activateTab(tab, form) {
  tabs.forEach(t => t.classList.remove("active"));
  forms.forEach(f => f.style.display = "none");
  tab.classList.add("active");
  form.style.display = "flex";
  clearMessages();
  // Hide 2FA form if switching tabs
  if(twoFactorForm !== form) {
    twoFactorForm.style.display = "none";
  }
}

// Tab click handlers
loginTab.onclick = () => activateTab(loginTab, loginForm);
signupTab.onclick = () => activateTab(signupTab, signupForm);
magicTab.onclick = () => activateTab(magicTab, magicForm);

// Show/hide password toggle
document.querySelectorAll(".toggle-password").forEach(toggle => {
  toggle.addEventListener("click", () => {
    const targetId = toggle.getAttribute("data-target");
    const input = document.getElementById(targetId);
    if (input.type === "password") {
      input.type = "text";
      toggle.textContent = "🙈";
    } else {
      input.type = "password";
      toggle.textContent = "👁️";
    }
  });
});

// Remember email input if user wants
window.addEventListener("load", () => {
  const rememberedEmail = localStorage.getItem("rememberedEmail");
  if(rememberedEmail) {
    loginEmailInput.value = rememberedEmail;
    rememberMeCheckbox.checked = true;
  }
});

// Store email if remember me checked
function storeEmail() {
  if (rememberMeCheckbox.checked) {
    localStorage.setItem("rememberedEmail", loginEmailInput.value);
  } else {
    localStorage.removeItem("rememberedEmail");
  }
}

// LOGIN with 2FA step
let loginUserCredential = null;
loginForm.onsubmit = async (e) => {
  e.preventDefault();
  clearMessages();
  showSpinner();
  try {
    // Store email if remember me checked
    storeEmail();

    // Sign in with email/password first
    loginUserCredential = await auth.signInWithEmailAndPassword(
      loginEmailInput.value,
      loginPasswordInput.value
    );
    if (!loginUserCredential.user.emailVerified) {
      loginMessage.textContent = "Please verify your email before logging in.";
      loginMessage.style.color = "salmon";
      loginUserCredential = null;
      return;
    }
    // Show 2FA form for phone number input
    loginForm.style.display = "none";
    twoFactorForm.style.display = "flex";
    twoFactorMessage.textContent = "Enter your phone number for 2FA";
    twoFactorMessage.style.color = "#00f7ff";
  } catch (err) {
    loginMessage.textContent = err.message;
    loginMessage.style.color = "salmon";
  } finally {
    hideSpinner();
  }
};

// Set up recaptcha verifier (invisible)
const recaptchaVerifier = new firebase.auth.RecaptchaVerifier(sendCodeBtn, {
  size: 'invisible',
  callback: () => {
    // recaptcha solved
  }
});

let confirmationResult = null;

sendCodeBtn.onclick = async () => {
  clearMessages();
  twoFactorMessage.textContent = "";
  if (!phoneNumberInput.value.trim()) {
    twoFactorMessage.textContent = "Please enter a valid phone number.";
    twoFactorMessage.style.color = "salmon";
    return;
  }
  showSpinner();
  try {
    confirmationResult = await auth.currentUser.linkWithPhoneNumber(
      phoneNumberInput.value.trim(),
      recaptchaVerifier
    );
    twoFactorMessage.textContent = "Verification code sent to your phone.";
    twoFactorMessage.style.color = "lightgreen";
    verificationCodeInput.style.display = "block";
    verifyCodeBtn.style.display = "block";
    sendCodeBtn.style.display = "none";
  } catch (err) {
    twoFactorMessage.textContent = err.message;
    twoFactorMessage.style.color = "salmon";
  } finally {
    hideSpinner();
  }
};

twoFactorForm.onsubmit = async (e) => {
  e.preventDefault();
  clearMessages();
  showSpinner();
  try {
    const code = verificationCodeInput.value.trim();
    if (!code) {
      twoFactorMessage.textContent = "Please enter the verification code.";
      twoFactorMessage.style.color = "salmon";
      return;
    }
    const result = await confirmationResult.confirm(code);
    // 2FA success, redirect to dashboard
    window.location.href = "dashboard.html";
  } catch (err) {
    twoFactorMessage.textContent = err.message;
    twoFactorMessage.style.color = "salmon";
  } finally {
    hideSpinner();
  }
};

// SIGNUP
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

// MAGIC LINK
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

// HANDLE MAGIC LINK SIGN-IN ON PAGE LOAD
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

// PASSWORD RESET
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

// GOOGLE LOGIN/SIGNUP
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
