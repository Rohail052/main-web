// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyBgz4GkCfMNzn7_nV4P7yry-MilTDDNbbI",
  authDomain: "login-d7f88.firebaseapp.com",
  projectId: "login-d7f88",
  storageBucket: "login-d7f88.appspot.com",
  messagingSenderId: "179833264327",
  appId: "1:179833264327:web:f405fc98edf2c2fe4f06e2",
  measurementId: "G-EL3NPFDQFL"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const rememberMeCheckbox = document.getElementById('rememberMe');
const spinner = document.getElementById('spinner');

const googleLoginBtn = document.getElementById('googleLogin');
const facebookLoginBtn = document.getElementById('facebookLogin');
const appleLoginBtn = document.getElementById('appleLogin');

const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const registerLink = document.getElementById('registerLink');

// Show spinner helper
function showSpinner() {
  spinner.style.display = 'block';
}

// Hide spinner helper
function hideSpinner() {
  spinner.style.display = 'none';
}

// Auto redirect if already logged in and session valid
auth.onAuthStateChanged(user => {
  if (user) {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && new Date().getTime() < storedUser.expireTime) {
      window.location.href = "After.html";
    } else {
      localStorage.removeItem("user");
      auth.signOut();
    }
  }
});

// Email/password login
loginForm.addEventListener('submit', e => {
  e.preventDefault();

  showSpinner();

  const email = emailInput.value;
  const password = passwordInput.value;

  auth.signInWithEmailAndPassword(email, password)
    .then(userCredential => {
      const user = userCredential.user;
      // Set expiration time (10 mins)
      const expirationTime = new Date().getTime() + 10 * 60 * 1000;
      localStorage.setItem("user", JSON.stringify({ email: user.email, expireTime: expirationTime }));
      
      alert("Login successful!");
      window.location.href = "After.html";
    })
    .catch(error => {
      alert(error.message);
    })
    .finally(() => {
      hideSpinner();
    });
});

// Register user
registerLink.addEventListener('click', () => {
  const email = prompt("Enter your email:");
  const password = prompt("Enter a password:");

  if (email && password) {
    showSpinner();
    auth.createUserWithEmailAndPassword(email, password)
      .then(() => alert("Registration successful!"))
      .catch(error => alert(error.message))
      .finally(() => hideSpinner());
  }
});

// Password reset
forgotPasswordLink.addEventListener('click', () => {
  const email = prompt("Enter your email to reset password:");
  if (email) {
    showSpinner();
    auth.sendPasswordResetEmail(email)
      .then(() => alert("Password reset email sent!"))
      .catch(error => alert(error.message))
      .finally(() => hideSpinner());
  }
});

// Google Login
googleLoginBtn.addEventListener('click', () => {
  showSpinner();
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      const expirationTime = new Date().getTime() + 10 * 60 * 1000;
      localStorage.setItem("user", JSON.stringify({ email: user.email, expireTime: expirationTime }));

      alert("Google login successful!");
      window.location.href = "After.html";
    })
    .catch(error => alert(error.message))
    .finally(() => hideSpinner());
});

// Facebook Login
facebookLoginBtn.addEventListener('click', () => {
  showSpinner();
  const provider = new firebase.auth.FacebookAuthProvider();

  auth.signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      const expirationTime = new Date().getTime() + 10 * 60 * 1000;
      localStorage.setItem("user", JSON.stringify({ email: user.email, expireTime: expirationTime }));

      alert("Facebook login successful!");
      window.location.href = "After.html";
    })
    .catch(error => alert(error.message))
    .finally(() => hideSpinner());
});

// Apple Login (using OAuth provider)
appleLoginBtn.addEventListener('click', () => {
  showSpinner();
  const provider = new firebase.auth.OAuthProvider('apple.com');

  auth.signInWithPopup(provider)
    .then(result => {
      const user = result.user;
      const expirationTime = new Date().getTime() + 10 * 60 * 1000;
      localStorage.setItem("user", JSON.stringify({ email: user.email, expireTime: expirationTime }));

      alert("Apple login successful!");
      window.location.href = "After.html";
    })
    .catch(error => alert(error.message))
    .finally(() => hideSpinner());
});


