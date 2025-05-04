document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const passwordInput = document.getElementById('password');
    const passwordToggle = document.getElementById('passwordToggle');

    // Fonctionnalité pour afficher/masquer le mot de passe
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.textContent = type === 'password' ? '\u{1F441}' : '\u{1F441}\u{20E1}'; // Œil barré
        });
    }

    // Gestion de la soumission du formulaire de connexion
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();

        const usernameInput = document.getElementById('username');
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