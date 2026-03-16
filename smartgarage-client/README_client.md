# SmartGarage - Frontend Client

Interface web client développée avec Next.js


# Fait par :

Stéphanie Romero-Vasquez
Matricule : 1696294

# Technologies utilisées:

- Next.js - Framework React
- React - Bibliothèque UI
- Tailwind CSS - styles
- Socket.IO Client - Temps réel
- Tesseract.js - Scan VIN
- Playwright - Tests E2E
- Stripe - Paiements en ligne

# Prérequis

- Node.js
- Backend SmartGarage sur le port 3000

# Installation
cd smartgarage-client
npm install

# Configuration

Crée un fichier .env.local dans le dossier smartgarage-client/ :
NEXT_PUBLIC_API_URL=http://localhost:3000

# Lancement
terminal 1 : node server.js

terminal 2: cd smartgarage-client

npm run dev -- -p 3001

L'application est sur http://localhost:3001

autre terminal : 
.\stripe.exe listen --forward-to localhost:3000/api/payment/webhook

# Fonctionnalités

Feature / description

13 / Authentification et profil client
14 / Gestion des véhicules  et scan VIN par OCR
15 / Prise de rendez-vous avec créneaux disponibles
16 / Facturation et paiement Stripe
17 / Suivi des services en temps réel (Socket.IO)
18 / Interface responsive (mobile / desktop)
19 / Notification push
20 / Historique du véhicule
21 / Évaluations et avis
22 / Tests E2E Playwright 

# Tests E2E 
npx playwright test

#Interface graphique
npx playwright test --ui

#rapport HTML 
npx playwright show-report 

# Structure 

smartgarage-client/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Connexion
│   ├── register/page.tsx     # Inscription
│   ├── dashboard/page.tsx    # Tableau de bord
│   ├── vehicules/page.tsx    # Véhicules
│   ├── rendezvous/page.tsx   # Rendez-vous
│   ├── factures/page.tsx     # Factures
│   ├── suivi/page.tsx        # Suivi temps réel
│   ├── notifications/page.tsx # Notifications
│   ├── historique/page.tsx   # Historique
│   ├── evaluations/page.tsx  # Évaluations
│   ├── profil/page.tsx       # Profil
│   ├── reset-password/page.tsx # Reset mot de passe
│   ├── success/page.tsx      # Succès paiement
│   └── cancel/page.tsx       # Annulation paiement
├── public/
│   └── assets/               # Images et icônes
├── tests/                    # Tests Playwright
├── .env.local                # Variables d'environnement (non partagé)
└── playwright.config.ts      # Configuration Playwright


# Notes
- Le fichier .env.local n'est pas partagé sur GitHub 
- Le backend doit démarré avant le frontend 
- Pour les paiements Stripe, le Stripe CLI doit être actif 


