document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');

  loginForm.addEventListener('submit', async function(event) {
    event.preventDefault();

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    errorMessage.textContent = '';

    try {
      const response = await fetch('https://page-de-connexion-html.vercel.app/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('username', username);
        window.location.href = 'page_accueil.html';
      } else {
        errorMessage.textContent = data.error || 'Erreur de connexion.';
      }
    } catch (error) {
      console.error('Erreur lors de la requête de connexion:', error);
      errorMessage.textContent = 'Erreur de connexion.';
    }
  });
});