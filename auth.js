// 1. Firebase Configuration (REPLACE with YOUR actual config from Firebase Console)
// You MUST replace these placeholders with your actual Firebase project configuration.
const firebaseConfig = {
    apiKey: "AIzaSyBgz4GkCfMNzn7_nV4P7yry-MilTDDNbbI",
  authDomain: "login-d7f88.firebaseapp.com",
  projectId: "login-d7f88",
  appId: "1:179833264327:web:f405fc98edf2c2fe4f06e2",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase Auth instance
const auth = firebase.auth();

// 2. DOM Elements
const showLoginBtn = document.getElementById('showLogin');
const showSignupBtn = document.getElementById('showSignup');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

const loginEmailInput = document.getElementById('loginEmail');
const loginPasswordInput = document.getElementById('loginPassword');
const loginErrorMsg = document.getElementById('loginError');

const signupEmailInput = document.getElementById('signupEmail');
const signupPasswordInput = document.getElementById('signupPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');
const signupErrorMsg = document.getElementById('signupError');

const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const forgotPasswordModal = document.getElementById('forgotPasswordModal');
const closeButton = forgotPasswordModal.querySelector('.close-button');
const resetEmailInput = document.getElementById('resetEmail');
const sendResetLinkBtn = document.getElementById('sendResetLink');
const resetSuccessMsg = document.getElementById('resetSuccess');
const resetErrorMsg = document.getElementById('resetError');

// 3. Helper Functions for UI
/**
 * Shows the specified form (login or signup) and hides the other.
 * Updates the active state of the toggle buttons.
 * @param {string} formToShow - 'login' or 'signup'.
 */
function showForm(formToShow) {
    loginForm.classList.remove('active');
    signupForm.classList.remove('active');
    showLoginBtn.classList.remove('active');
    showSignupBtn.classList.remove('active');

    if (formToShow === 'login') {
        loginForm.classList.add('active');
        showLoginBtn.classList.add('active');
    } else {
        signupForm.classList.add('active');
        showSignupBtn.classList.add('active');
    }
    // Clear any previous error/success messages when switching forms
    clearMessages();
}

/**
 * Displays a message in the specified element.
 * @param {HTMLElement} element - The DOM element to display the message in.
 * @param {string} message - The message text.
 * @param {boolean} isError - True if it's an error message, false for success.
 */
function displayMessage(element, message, isError = true) {
    element.textContent = message;
    // Remove all message-related classes first to ensure correct styling
    element.classList.remove('show', 'error-message', 'success-message');
    if (isError) {
        element.classList.add('error-message', 'show');
    } else {
        element.classList.add('success-message', 'show');
    }
}

/**
 * Clears all error and success messages from the UI.
 */
function clearMessages() {
    [loginErrorMsg, signupErrorMsg, resetSuccessMsg, resetErrorMsg].forEach(el => {
        el.textContent = '';
        el.classList.remove('show', 'error-message', 'success-message');
    });
}

/**
 * Shows a modal by adding the 'show' class.
 * @param {HTMLElement} modal - The modal element to show.
 */
function showModal(modal) {
    modal.classList.add('show');
}

/**
 * Hides a modal by removing the 'show' class.
 * Clears messages and resets input fields within the modal.
 * @param {HTMLElement} modal - The modal element to hide.
 */
function hideModal(modal) {
    modal.classList.remove('show');
    clearMessages(); // Clear messages when modal closes
    resetEmailInput.value = ''; // Clear email input
}

// 4. Event Listeners for UI Toggles
showLoginBtn.addEventListener('click', () => showForm('login'));
showSignupBtn.addEventListener('click', () => showForm('signup'));

// Event listener to open the forgot password modal
forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default link behavior
    showModal(forgotPasswordModal);
});

// Event listener to close the forgot password modal using the 'x' button
closeButton.addEventListener('click', () => hideModal(forgotPasswordModal));

// Close modal if user clicks outside of the modal content
window.addEventListener('click', (event) => {
    if (event.target === forgotPasswordModal) {
        hideModal(forgotPasswordModal);
    }
});

// Initially show login form when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    showForm('login');
});

// 5. Firebase Authentication Logic

/**
 * Handles user signup form submission.
 */
signupForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission
    clearMessages(); // Clear previous messages

    const email = signupEmailInput.value;
    const password = signupPasswordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Client-side validation for password length
    if (password.length < 6) {
        displayMessage(signupErrorMsg, 'Password should be at least 6 characters.');
        return;
    }

    // Client-side validation for password match
    if (password !== confirmPassword) {
        displayMessage(signupErrorMsg, 'Passwords do not match.');
        return;
    }

    try {
        // Attempt to create a new user with email and password using Firebase Auth
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        console.log('User signed up successfully:', userCredential.user);
        displayMessage(signupErrorMsg, 'Account created successfully! You can now log in.', false);

        // Clear form fields after successful signup
        signupEmailInput.value = '';
        signupPasswordInput.value = '';
        confirmPasswordInput.value = '';

        // Optionally, switch to the login form after a short delay for user to read success message
        setTimeout(() => showForm('login'), 2000);

    } catch (error) {
        // Handle Firebase authentication errors during signup
        console.error('Signup Error:', error.code, error.message);
        let message = 'An unknown error occurred during signup.';
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'This email is already in use. Please use a different one or log in.';
                break;
            case 'auth/invalid-email':
                message = 'The email address is not valid.';
                break;
            case 'auth/weak-password':
                message = 'The password is too weak. Please choose a stronger one.';
                break;
            default:
                message = `Signup failed: ${error.message}`;
        }
        displayMessage(signupErrorMsg, message);
    }
});

/**
 * Handles user login form submission.
 */
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default form submission
    clearMessages(); // Clear previous messages

    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    try {
        // Attempt to sign in the user with email and password using Firebase Auth
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('User logged in successfully:', userCredential.user);
        displayMessage(loginErrorMsg, 'Login successful! Redirecting...', false);

        // Clear form fields after successful login
        loginEmailInput.value = '';
        loginPasswordInput.value = '';

        // Redirect to the dashboard page after a short delay
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000); // Redirect after 1 second

    } catch (error) {
        // Handle Firebase authentication errors during login
        console.error('Login Error:', error.code, error.message);
        let message = 'An unknown error occurred during login.';
        switch (error.code) {
            case 'auth/invalid-email':
            case 'auth/user-not-found':
                message = 'No user found with this email or invalid email.';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password. Please try again.';
                break;
            case 'auth/too-many-requests':
                message = 'Too many failed login attempts. Please try again later.';
                break;
            default:
                message = `Login failed: ${error.message}`;
        }
        displayMessage(loginErrorMsg, message);
    }
});

/**
 * Handles sending a password reset link.
 */
sendResetLinkBtn.addEventListener('click', async () => {
    clearMessages(); // Clear previous messages in the modal

    const email = resetEmailInput.value;
    if (!email) {
        displayMessage(resetErrorMsg, 'Please enter your email address to reset password.');
        return;
    }

    try {
        // Attempt to send a password reset email using Firebase Auth
        await auth.sendPasswordResetEmail(email);
        displayMessage(resetSuccessMsg, 'Password reset link sent to your email! Please check your inbox ,spam or junk folder .', false);
        resetEmailInput.value = ''; // Clear email input field

        // Close the modal after a short delay to allow the user to read the success message
        setTimeout(() => hideModal(forgotPasswordModal), 3000);

    } catch (error) {
        // Handle Firebase authentication errors during password reset
        console.error('Password Reset Error:', error.code, error.message);
        let message = 'An unknown error occurred while sending the reset link.';
        switch (error.code) {
            case 'auth/invalid-email':
                message = 'The email address is not valid.';
                break;
            case 'auth/user-not-found':
                message = 'No user found with this email address.';
                break;
            default:
                message = `Failed to send reset link: ${error.message}`;
        }
        displayMessage(resetErrorMsg, message);
    }
});

// Optional: Monitor Auth State (useful for knowing if a user is logged in across pages)
// This listener will fire whenever the user's sign-in state changes.
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in.
        console.log("User is logged in:", user.email, user.uid);
        // You could use this to redirect authenticated users away from login/signup pages
        // if they try to access them while already logged in.
        // Example: if (window.location.pathname === '/' || window.location.pathname === 'Newlogin.html') {
        //     window.location.href = 'dashboard.html';
        // }
    } else {
        // No user is signed in.
        console.log("No user is logged in.");
        // If on a protected page (like dashboard), you might redirect them to login.
        // Example: if (window.location.pathname === '/dashboard.html') {
        //     window.location.href = 'Newlogin.html';
        // }
    }
});
