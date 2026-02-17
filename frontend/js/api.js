// Configuration de l'API
const API_URL = 'http://localhost:3000';

// Fonction utilitaire pour les appels API
async function apiCall(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('token');
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Ajouter le token JWT si disponible
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }

    // Ajouter le body si nécessaire
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const result = await response.json();

        // Vérifier si le token est expiré
        if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'error.html?error=expired';
            throw new Error('Token expiré');
        }

        // Vérifier les permissions
        if (response.status === 403) {
            window.location.href = 'error.html?error=unauthorized';
            throw new Error('Accès refusé');
        }

        if (!response.ok) {
            throw new Error(result.message || 'Erreur API');
        }

        return result;
    } catch (error) {
        console.error('Erreur API:', error);
        throw error;
    }
}

// Fonction pour afficher un message d'erreur
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

// Fonction pour afficher un message de succès
function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        setTimeout(() => {
            element.style.display = 'none';
        }, 5000);
    }
}

// Fonction pour formater une date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Vérifier si l'utilisateur est connecté
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Obtenir les infos de l'utilisateur stockées
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}