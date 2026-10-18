# Lockbox

Un gestionnaire de mots de passe moderne et sécurisé. Cconstruit avec Go, React, PostgreSQL et Docker.

---

## Fonctionnalités

- **Authentification JWT** — connexion sécurisée avec token
- **Chiffrement AES-256-GCM** — chaque mot de passe est chiffré avant d'être stocké
- **Générateur de mots de passe** — longueur et complexité personnalisables
- **Copie en un clic** — dans le presse-papier sans afficher le mot de passe
- **Organisation par dossiers** — pour classer tes entrées
- **Indicateur de force** — analyse la robustesse de chaque mot de passe
- **Entièrement dockerisé** — un seul `docker-compose up` pour tout lancer

---

## Stack technique

| Couche | Technologie |
|--------|------------|
| Backend | Go + Chi |
| Frontend | React + CSS pur |
| Base de données | PostgreSQL |
| Chiffrement | AES-256-GCM |
| Auth | JWT + bcrypt |
| Déploiement | Docker + Docker Compose |

---

## Architecture système code

```
┌─────────────────────────────────────────────────────────┐
│                      INTERNET                           │
└─────────────────────────┬───────────────────────────────┘
                          │
                     ┌────▼─────┐
                     │ pfSense  │  Règles strictes, VLAN dédié
                     └────┬─────┘
                          │
                ┌─────────▼──────────┐
                │   Reverse Proxy    │  Traefik — HTTPS obligatoire
                │   (Let's Encrypt)  │
                └─────────┬──────────┘
                          │
           ┌──────────────┴────────────────┐
           │                               │
     ┌─────▼──────┐                ┌───────▼───────┐
     │  Frontend  │                │   API Go/Gin  │
     │  (React)   │◄──────────────►│               │
     └────────────┘   HTTPS/JSON   └────────┬──────┘
                                            │
                                    ┌───────▼────────┐
                                    │  PostgreSQL    │
                                    │  (blobs        │
                                    │   chiffrés)    │
                                    └────────────────┘
```

## Architecture système infra

```
┌─────────────────────────────────────────────────────────┐
│                      INTERNET                           │
└─────────────────────────┬───────────────────────────────┘
                          │
                     ┌────▼─────┐
                     │ pfSense  │  Règles strictes, VLAN dédié
                     └────┬─────┘
                          │
                ┌─────────▼──────────┐
                │   Reverse Proxy    │  Traefik — HTTPS obligatoire
                │   (Let's Encrypt)  │
                └─────────┬──────────┘
                          │
           ┌──────────────┴────────────────┐
           │                               │
     ┌─────▼──────┐                ┌───────▼───────┐
     │  Serveur   │                │   Serveur     │
     │  Compute   │◄──────────────►│   Stockage    │
     │            │   Requêtes SQL │ (PostgreSQL,  │
     │            │                │  blobs        │
     └────────────┘                │  chiffrés)    │
                                   └───────────────┘
 
```



---

## Structure du projetrepository

```
lockbox/
├── .github/
│   └── workflows/
│       ├── docker-image.yml
│       └── node.js.yml
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── Dockerfile
│   ├── go.mod
│   ├── go.sum
│   └── main.go
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── assets/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── docker-compose.dev.yml
├── .env.example
└── README.md
```

---

L'application sera disponible sur :
- Grand public -> https://lockbox.fr

---

## Sécurité

- Les mots de passe maîtres sont hachés avec **bcrypt**
- Les mots de passe stockés sont chiffrés avec **AES-256-GCM**
- Les tokens JWT expirent après **24h**

---

## Licence

Ce projet est distribué sous licence [AGPL-3.0](LICENSE).

Copyright (C) 2026 Alain Corazzini