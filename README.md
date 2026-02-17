# Projet IoT - Système de Monitoring avec API REST et WebSocket
## Description

Système complet de supervision et de monitorage IoT avec:
- API REST sécurisée avec JWT
- Communication WebSocket pour Raspberry Pi
- Interface web d'administration
- Gestion des utilisateurs et rôles (admin/standard)
- Stockage MongoDB

## Architecture

- **Backend**: Node.js + Express.js + MongoDB + WebSocket
- **Frontend**: HTML/CSS/JavaScript (pas de framework)
- **Client**: Python (Raspberry Pi)
- **Sécurité**: JWT, Bcrypt, Helmet, CORS

## Installation

### 1. Prérequis

- Node.js (v14 ou supérieur)
- MongoDB (v4 ou supérieur)
- Python 3.7+ (pour Raspberry Pi)
- npm ou yarn

### 2. Installation du serveur

```bash
cd server
npm install
```

### 3. Configuration

Créer un fichier `.env` dans le dossier `server/` avec:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/iot_project
JWT_SECRET=votre_secret_jwt_tres_securise_changez_moi_absolument
JWT_EXPIRE=1h
WS_PORT=8080
NODE_ENV=development
CORS_ORIGIN=http://localhost:5500
```

** IMPORTANT**: Changez `JWT_SECRET` pour un secret unique et sécurisé !

### 4. Démarrer MongoDB

```bash
# Sous Windows
net start MongoDB

# Sous Linux/Mac
sudo systemctl start mongod
# ou
sudo service mongod start
```

### 5. Démarrer le serveur

```bash
cd server
npm start

# Ou en mode développement avec auto-reload
npm run dev
```

Le serveur démarre sur:
- API HTTP: `http://localhost:3000`
- WebSocket: `ws://localhost:3000/ws`

### 6. Installation du client Raspberry Pi

```bash
cd raspberry-pi
pip install -r requirements.txt
```

Modifier le `DEVICE_ID` dans `client.py`:

```python
DEVICE_ID = "PI_001"  # Changer selon votre device
WS_URL = "ws://ADRESSE_SERVEUR:3000/ws"
```

### 7. Démarrer le client Raspberry Pi

```bash
python3 client.py
```

### 8. Ouvrir l'interface web

Ouvrir `frontend/index.html` dans un navigateur ou utiliser un serveur web local:

```bash
# Avec Python
cd frontend
python -m http.server 5500

# Avec Node.js (http-server)
npx http-server frontend -p 5500
```

Accéder à: `http://localhost:5500`

##  Création du premier utilisateur admin

### Option 1: Via l'interface web

1. Aller sur `http://localhost:5500/signup.html`
2. Créer un compte
3. Se connecter à MongoDB et modifier le rôle:

```javascript
// Dans MongoDB Compass ou mongo shell
use iot_project
db.users.updateOne(
  { email: "votre@email.com" },
  { $set: { role: "admin" } }
)
```

### Option 2: Via l'API directement

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

##  Utilisation

### 1. Créer un compte utilisateur (Interface Web)

1. Aller sur la page d'inscription
2. Remplir le formulaire
3. Se connecter

### 2. Créer et associer un device (Admin)

1. Se connecter en tant qu'admin
2. Aller dans "Administration"
3. Créer un nouveau device avec un Device ID unique (ex: PI_001)
4. Associer le device à un utilisateur

### 3. Démarrer le Raspberry Pi

1. Modifier le `DEVICE_ID` dans `client.py`
2. Lancer `python3 client.py`
3. Le Pi s'authentifie automatiquement
4. Les mesures commencent à être envoyées

### 4. Consulter les mesures

- **Utilisateur standard**: Voir uniquement ses mesures
- **Admin**: Voir toutes les mesures et gérer le système

### 5. Envoyer des commandes (Admin)

Dans l'interface admin, sélectionner un device et une action:
- Allumer/Éteindre LED
- Activer/Désactiver Buzzer



##  Sécurité

-  Mots de passe hashés avec bcrypt
-  JWT avec expiration 1h
- Validation des rôles (admin/standard)
- Helmet pour sécuriser les headers
- CORS configuré
- Validation des deviceId pour WebSocket
- Journalisation des commandes
