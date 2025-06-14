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

// Get DOM elements
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const rememberMeCheckbox = document.getElementById('rememberMe');
const spinner = document.getElementById('spinner');
const errorMessageDiv = document.getElementById('errorMessage'); // For displaying error messages

const googleLoginBtn = document.getElementById('googleLogin');
const facebookLoginBtn = document.getElementById('facebookLogin');
const appleLoginBtn = document.getElementById('appleLogin');

const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const registerLink = document.getElementById('registerLink');

// Helper functions for spinner and error messages
function showSpinner() {
    spinner.style.display = 'block';
    errorMessageDiv.style.display = 'none'; // Hide any previous error message
}

function hideSpinner() {
    spinner.style.display = 'none';
}

function showErrorMessage(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
}

function hideErrorMessage() {
    errorMessageDiv.style.display = 'none';
    errorMessageDiv.textContent = '';
}

// Auto redirect if already logged in and session valid based on persistence
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in. Redirect to After.html
        console.log("User already logged in:", user.email);
        window.location.href = "After.html";
    } else {
        // User is signed out.
        console.log("No user logged in.");
    }
    // Hide spinner once auth state is determined (e.g., on page load)
    hideSpinner();
});


// Email/password login
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showSpinner();
    hideErrorMessage(); // Clear previous errors

    const email = emailInput.value;
    const password = passwordInput.value;
    const rememberMe = rememberMeCheckbox.checked;

    try {
        // Set persistence based on "Remember Me" checkbox
        if (rememberMe) {
            await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        } else {
            await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
        }

        await auth.signInWithEmailAndPassword(email, password);
        // On successful login, onAuthStateChanged will handle the redirect
        // We don't need to store user in localStorage manually for persistence
        // If the redirect doesn't happen immediately (e.g., if After.html doesn't exist),
        // alert the user and proceed
        alert("Login successful!");
        window.location.href = "After.html";
    } catch (error) {
        console.error("Login Error:", error);
        showErrorMessage(error.message);
    } finally {
        hideSpinner();
    }
});

// Register user
registerLink.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevent default link behavior
    hideErrorMessage(); // Clear previous errors

    const email = prompt("Enter your email to register:");
    const password = prompt("Enter a password (min 6 characters):");

    if (email && password) {
        if (password.length < 6) {
            showErrorMessage("Password must be at least 6 characters long.");
            return;
        }
        showSpinner();
        try {
            await auth.createUserWithEmailAndPassword(email, password);
            alert("Registration successful! You can now log in.");
        } catch (error) {
            console.error("Registration Error:", error);
            showErrorMessage(error.message);
        } finally {
            hideSpinner();
        }
    } else if (email || password) {
        showErrorMessage("Both email and password are required for registration.");
    }
});

// Password reset
forgotPasswordLink.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevent default link behavior
    hideErrorMessage(); // Clear previous errors

    const email = prompt("Enter your email to reset password:");
    if (email) {
        showSpinner();
        try {
            await auth.sendPasswordResetEmail(email);
            alert("Password reset email sent! Check your inbox.");
        } catch (error) {
            console.error("Password Reset Error:", error);
            showErrorMessage(error.message);
        } finally {
            hideSpinner();
        }
    } else {
        showErrorMessage("Please enter your email address.");
    }
});

// Google Login
googleLoginBtn.addEventListener('click', async () => {
    showSpinner();
    hideErrorMessage(); // Clear previous errors
    const provider = new firebase.auth.GoogleAuthProvider();

    try {
        // Set persistence before signing in with popup
        const rememberMe = rememberMeCheckbox.checked;
        if (rememberMe) {
            await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        } else {
            await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
        }

        await auth.signInWithPopup(provider);
        // onAuthStateChanged will handle the redirect
        alert("Google login successful!");
        window.location.href = "After.html";
    } catch (error) {
        console.error("Google Login Error:", error);
        // Handle specific errors like popup closed by user
        if (error.code === 'auth/popup-closed-by-user') {
            showErrorMessage("Google login cancelled.");
        } else {
            showErrorMessage(error.message);
        }
    } finally {
        hideSpinner();
    }
});

// Facebook Login
facebookLoginBtn.addEventListener('click', async () => {
    showSpinner();
    hideErrorMessage(); // Clear previous errors
    const provider = new firebase.auth.FacebookAuthProvider();

    try {
        // Optional: Request additional permissions if needed (e.g., 'email', 'public_profile')
        // provider.addScope('public_profile');
        // provider.addScope('email');

        // Set persistence before signing in with popup
        const rememberMe = rememberMeCheckbox.checked;
        if (rememberMe) {
            await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        } else {
            await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
        }

        await auth.signInWithPopup(provider);
        // onAuthStateChanged will handle the redirect
        alert("Facebook login successful!");
        window.location.href = "After.html";
    } catch (error) {
        console.error("Facebook Login Error:", error);
        if (error.code === 'auth/popup-closed-by-user') {
            showErrorMessage("Facebook login cancelled.");
        } else {
            showErrorMessage(error.message);
        }
    } finally {
        hideSpinner();
    }
});

// Apple Login
appleLoginBtn.addEventListener('click', async () => {
    showSpinner();
    hideErrorMessage(); // Clear previous errors
    const provider = new firebase.auth.OAuthProvider('apple.com');

    // Add required scopes for Apple login
    // For production, you might need to request 'email' or 'name' if required
    // provider.addScope('email');
    // provider.addScope('name');

    try {
        // Set persistence before signing in with popup
        const rememberMe = rememberMeCheckbox.checked;
        if (rememberMe) {
            await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
        } else {
            await auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
        }

        await auth.signInWithPopup(provider);
        // onAuthStateChanged will handle the redirect
        alert("Apple login successful!");
        window.location.href = "After.html";
    } catch (error) {
        console.error("Apple Login Error:", error);
        if (error.code === 'auth/popup-closed-by-user') {
            showErrorMessage("Apple login cancelled.");
        } else {
            showErrorMessage(error.message);
        }
    } finally {
        hideSpinner();
    }
});
