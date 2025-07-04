const users = [
  { email: 'user@example.com', password: 'password' },
  { email: 'ch@rohail.com', password: 'Admin@124' },
  { email: 'user1@rohail.com', password: '124' },
  { email: 'user2@rohail.com', password: '124' },
];

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('passwordInput');
  const rememberMe = document.getElementById('rememberMe');
  const errorMessage = document.getElementById('errorMessage');

  // Auto-fill remembered user
  const remembered = JSON.parse(localStorage.getItem('rememberedUser'));
  if (remembered) {
    emailInput.value = remembered.email;
    passwordInput.value = remembered.password;
    rememberMe.checked = true;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      sessionStorage.setItem('loggedIn', 'true');
      sessionStorage.setItem('loginTime', Date.now());

      if (rememberMe.checked) {
        localStorage.setItem('rememberedUser', JSON.stringify({ email, password }));
      } else {
        localStorage.removeItem('rememberedUser');
      }

      window.location.href = 'work.html';
    } else {
      errorMessage.textContent = 'Invalid email or password.';
    }
  });
});
