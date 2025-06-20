// Simulated user database
const users = [
    { email: 'user@example.com', password: 'password' },
    { email: 'ch@rohail.com', password: '124' },
    { email: 'user1@rohail.com', password: '124' },
    { email: 'user2@rohail.com', password: '124' },
];

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value.trim();

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        sessionStorage.setItem('loggedIn', 'true');
        window.location.href = 'work.html';
    } else {
        alert('Invalid credentials. Please try again.');
    }
}

// Protect pages (like Calculator.html) from unauthorized access
window.onload = function () {
    const loggedIn = sessionStorage.getItem('loggedIn');
    const restrictedPages = ['Calculator.html', 'work.html'];

    if (restrictedPages.some(page => window.location.href.includes(page)) && !loggedIn) {
        alert('You must log in first.');
        window.location.href = 'admin.html';
    }
};

// Logout function
function handleLogout() {
    sessionStorage.removeItem('loggedIn');
    window.location.href = 'admin.html';
}
