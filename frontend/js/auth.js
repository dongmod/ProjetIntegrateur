// Configuration de l'API
const API_URL = 'http://localhost:3000';

// Gestion du formulaire de connexion
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('errorMessage');

        try {
            errorDiv.style.display = 'none';
            
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                // Stocker le token et les infos utilisateur
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Rediriger vers le dashboard
                window.location.href = 'dashboard.html';
            } else {
                errorDiv.textContent = data.message || 'Erreur de connexion';
                errorDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Erreur:', error);
            errorDiv.textContent = 'Erreur de connexion au serveur. Vérifiez que le serveur est démarré sur http://localhost:3000';
            errorDiv.style.display = 'block';
        }
    });
}

// Gestion du formulaire d'inscription
const signupForm = document.getElementById('signupForm');
if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const errorDiv = document.getElementById('errorMessage');
        const successDiv = document.getElementById('successMessage');

        // Réinitialiser les messages
        errorDiv.style.display = 'none';
        successDiv.style.display = 'none';

        // Validation
        if (password !== confirmPassword) {
            errorDiv.textContent = 'Les mots de passe ne correspondent pas';
            errorDiv.style.display = 'block';
            return;
        }

        if (password.length < 6) {
            errorDiv.textContent = 'Le mot de passe doit contenir au moins 6 caractères';
            errorDiv.style.display = 'block';
            return;
        }

        try {
            console.log('Envoi de la requête à:', `${API_URL}/api/auth/signup`);
            
            const response = await fetch(`${API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    username, 
                    email, 
                    password, 
                    role: 'standard' 
                })
            });

            console.log('Statut de la réponse:', response.status);
            
            const data = await response.json();
            console.log('Données reçues:', data);

            if (data.success) {
                successDiv.textContent = 'Compte créé avec succès ! Redirection...';
                successDiv.style.display = 'block';
                errorDiv.style.display = 'none';
                
                // Rediriger vers la page de connexion après 2 secondes
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            } else {
                errorDiv.textContent = data.message || 'Erreur lors de l\'inscription';
                errorDiv.style.display = 'block';
                successDiv.style.display = 'none';
            }
        } catch (error) {
            console.error('Erreur complète:', error);
            errorDiv.textContent = 'Erreur de connexion au serveur. Vérifiez que le serveur Node.js est démarré sur http://localhost:3000';
            errorDiv.style.display = 'block';
            successDiv.style.display = 'none';
        }
    });
}