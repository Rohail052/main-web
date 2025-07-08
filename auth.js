// ✅ Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyBgz4GkCfMNzn7_nV4P7yry-MilTDDNbbI",
  authDomain: "login-d7f88.firebaseapp.com",
  projectId: "login-d7f88",
  appId: "1:179833264327:web:f405fc98edf2c2fe4f06e2",
});

const auth = firebase.auth();
const db = firebase.firestore();
const ADMIN_EMAIL = "chadmin@chrohail.com";

// ✅ Spinner control
const spinnerOverlay = document.getElementById("spinnerOverlay");
const showSpinner = () => (spinnerOverlay.style.display = "flex");
const hideSpinner = () => (spinnerOverlay.style.display = "none");

// ✅ Redirect based on user role
function redirectBasedOnRole(email) {
  if (email === ADMIN_EMAIL) {
    window.location.href = "admindashboard.html";
  } else {
    window.location.href = "dashboard.html";
  }
}

// ✅ On load: set remembered email, handle magic link
window.onload = () => {
  hideSpinner(); // ensure spinner is hidden on load
  const savedEmail = localStorage.getItem("rememberedEmail");
  if (savedEmail) {
    document.getElementById("loginEmail").value = savedEmail;
    document.getElementById("rememberMe").checked = true;
  }
  if (auth.isSignInWithEmailLink(window.location.href)) {
    handleMagicLinkLogin();
  }
};

// ✅ Save remembered email
function rememberEmail(email) {
  if (document.getElementById("rememberMe").checked) {
    localStorage.setItem("rememberedEmail", email);
  } else {
    localStorage.removeItem("rememberedEmail");
  }
}

// ✅ Login
loginForm.onsubmit = async (e) => {
  e.preventDefault();
  showSpinner();
  const email = loginEmail.value.trim();
  const password = loginPassword.value;
  try {
    rememberEmail(email);
    const result = await auth.signInWithEmailAndPassword(email, password);
    redirectBasedOnRole(result.user.email);
    return; // ⛔ prevent spinner from continuing
  } catch (err) {
    alert(err.message);
  } finally {
    hideSpinner();
  }
};

// ✅ Signup
signupForm.onsubmit = async (e) => {
  e.preventDefault();
  showSpinner();
  const email = signupEmail.value.trim();
  const password = signupPassword.value;
  try {
    const result = await auth.createUserWithEmailAndPassword(email, password);
    await db.collection("users").doc(result.user.uid).set({
      email,
      createdAt: new Date().toISOString(),
    });
    redirectBasedOnRole(email);
    return;
  } catch (err) {
    alert(err.message);
  } finally {
    hideSpinner();
  }
};

// ✅ Forgot Password
resetPassword.onclick = async () => {
  const email = prompt("Enter your email to reset password:");
  if (email) {
    showSpinner();
    try {
      await auth.sendPasswordResetEmail(email.trim());
      alert("Password reset email sent!");
    } catch (err) {
      alert(err.message);
    } finally {
      hideSpinner();
    }
  }
};

// ✅ Google Login/Signup
async function handleGoogleLogin() {
  showSpinner();
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    const email = result.user.email;
    const uid = result.user.uid;

    const doc = await db.collection("users").doc(uid).get();
    if (!doc.exists) {
      await db.collection("users").doc(uid).set({
        email,
        createdAt: new Date().toISOString(),
      });
    }

    redirectBasedOnRole(email);
    return;
  } catch (err) {
    alert(err.message);
  } finally {
    hideSpinner();
  }
}

googleLogin.onclick = handleGoogleLogin;
googleSignup.onclick = handleGoogleLogin;

// ✅ Magic Link
magicForm.onsubmit = async (e) => {
  e.preventDefault();
  const email = magicEmail.value.trim();
  showSpinner();
  try {
    await auth.sendSignInLinkToEmail(email, {
      url: window.location.href,
      handleCodeInApp: true,
    });
    localStorage.setItem("emailForSignIn", email);
    alert("Magic link sent to your email!");
  } catch (err) {
    alert(err.message);
  } finally {
    hideSpinner();
  }
};

// ✅ Handle magic link login
async function handleMagicLinkLogin() {
  showSpinner();
  try {
    const email = localStorage.getItem("emailForSignIn") || prompt("Enter your email:");
    const result = await auth.signInWithEmailLink(email, window.location.href);

    const uid = result.user.uid;
    const doc = await db.collection("users").doc(uid).get();
    if (!doc.exists) {
      await db.collection("users").doc(uid).set({
        email,
        createdAt: new Date().toISOString(),
      });
    }

    localStorage.removeItem("emailForSignIn");
    redirectBasedOnRole(email);
    return;
  } catch (err) {
    alert(err.message);
  } finally {
    hideSpinner();
  }
}
