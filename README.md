# Salon Dreadlocks — Système de Gestion & Réservation

Application de gestion pour salon de coiffure spécialisé (dreadlocks) : rendez-vous en ligne, ventes, clients, stock/produits, confection (fabrication de produits), pointage du personnel, dépenses et rapports financiers.

Le projet est composé de deux parties :

- **`backend/`** — API REST développée avec **Laravel 12** (PHP 8.2)
- **`frontend/`** — Application web développée avec **React + TypeScript** (Vite)

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Architecture & rôles](#architecture--rôles)
- [Installation](#installation)
- [Comptes de démonstration](#comptes-de-démonstration)
- [Structure du projet](#structure-du-projet)
- [Scripts utiles](#scripts-utiles)

---

## Fonctionnalités

### Site public (vitrine + réservation en ligne)
- Page vitrine du salon (infos, horaires, prestations, produits, réalisations)
- Prise de rendez-vous en ligne par les clients, sans compte, avec créneaux disponibles en temps réel
- Consultation et annulation de ses propres rendez-vous
- Galerie de réalisations publiques, avec mise en avant type "Instagram" (réalisations épinglées)
- Support multi-salon via `slug` (chaque salon a ses propres pages publiques), avec un salon par défaut

### Rendez-vous
- Prise de RDV avec choix des prestations, coiffeur, créneau
- Acompte à la réservation, suivi des paiements (acompte / solde), historique des paiements
- Statuts : confirmation, passage "en cours" (client arrivé), finalisation (génère une vente), annulation
- Reçus PDF (acompte et solde)

### Ventes & Prestations
- Enregistrement des ventes (produits + prestations), calcul de réduction par points de fidélité
- Vérification du stock disponible avant vente
- Reçu de vente imprimable/PDF
- Annulation de vente (rôle gestionnaire)

### Clients
- Fiche client avec photos (avant/après, style demandé)
- Historique des prestations et achats

### Produits & Stock
- Catalogue produits avec **catégories** et **attributs/variantes** (couleur, taille, etc.)
- Double type de stock : stock **vente** et stock **utilisation** (consommation interne du salon)
- Mouvements de stock, ajustements, alertes de stock bas
- Transferts de stock (avec validation)
- Circuit de **validation des produits** créés par le personnel (en attente → validé/rejeté) avant publication

### Confection (production)
- Fabrication de produits à partir de matières premières (ex. fabrication d'extensions/dreadlocks)
- Calcul automatique du coût (matière première + main d'œuvre), du prix de vente suggéré, de la marge
- À la finalisation, création automatique du produit/variante au catalogue et entrée en stock (vente, usage interne, ou mixte)

### Personnel
- Gestion des utilisateurs (coiffeurs, gérants, gestionnaires) avec spécialité, salaire mensuel
- **Pointage** (arrivée/départ) avec statistiques de présence (présent, retard, absent, congé, heures travaillées)
- Statistiques individuelles : CA généré, prestations et confections réalisées dans le mois

### Dépenses
- Suivi des dépenses par catégorie, statistiques mensuelles

### Rapports
- Rapport global, détail des ventes, trésorerie, comparaison de périodes
- Arrêté de compte

### Notifications
- Centre de notifications interne (lues/non lues, compteur, suppression)

---

## Stack technique

### Backend (`backend/`)
| Composant | Détail |
|---|---|
| Framework | Laravel 12 (PHP ^8.2) |
| Authentification API | Laravel Sanctum (tokens, connexion par numéro de téléphone) |
| Génération PDF | barryvdh/laravel-dompdf (reçus, arrêtés de compte) |
| Base de données | SQLite par défaut (configurable via `.env`) |
| Tests | PHPUnit |

### Frontend (`frontend/`)
| Composant | Détail |
|---|---|
| Framework | React + TypeScript |
| Build tool | Vite |
| Routing | React Router 7 |
| Data fetching | TanStack React Query |
| UI | Tailwind CSS 4, Radix UI, MUI (Material UI) |
| Formulaires | React Hook Form |
| Graphiques | Recharts |
| Drag & drop | react-dnd |
| HTTP client | Axios |
| Notifications (toasts) | Sonner |
| PWA | vite-plugin-pwa (application installable) |

---

## Architecture & rôles

L'API expose des routes REST sous `/api`. Les routes publiques (vitrine, prise de RDV, reçus) ne nécessitent pas d'authentification ; toutes les autres passent par `auth:sanctum`, puis sont filtrées par le middleware `check.role`.

Trois rôles :

| Rôle | Portée |
|---|---|
| `gestionnaire` | Accès total : utilisateurs, configuration du salon, catégories/attributs, suppression, validation des produits |
| `gerant` | Gestion opérationnelle : validation des transferts, statistiques, création de produits |
| `coiffeur` | Opérations quotidiennes : clients, ventes, rendez-vous, pointage, confections, dépenses (lecture), rapports |

Une route de test `GET /api/test` liste les modules actifs de l'API et la description des rôles.

---

## Installation

### Prérequis
- PHP >= 8.2, Composer
- Node.js (version récente), npm ou pnpm
- Extension PHP SQLite (ou MySQL/PostgreSQL si vous adaptez la config DB)

### 1. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate

# Créer la base de données SQLite (si non existante)
touch database/database.sqlite

# Exécuter les migrations et peupler avec des données de démonstration
php artisan migrate --seed

# Lancer le serveur de développement
php artisan serve
```

Par défaut, `php artisan serve` écoute sur `http://127.0.0.1:8000`.

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

L'URL de l'API est lue depuis la variable d'environnement `VITE_API_BASE_URL` (fichier `.env` à créer dans `frontend/`), avec `http://127.0.0.1:8000/api` comme valeur par défaut :

```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

---

## Comptes de démonstration

Le seeder `UserSeeder` crée des comptes de test (connexion par **numéro de téléphone**) :

| Rôle | Téléphone | Mot de passe |
|---|---|---|
| Gestionnaire | `+22600000000` | `123456` |
| Gérant | `+22670123456` | `123456` |
| Coiffeur | `+22670345678` | `345678` |
| Coiffeur | `+22670456789` | `456789` |
| Coiffeur | `+22670567890` | `567890` |
| Coiffeur | `+22670678901` | `678901` |

⚠️ Ce sont des données de démonstration destinées au développement local. Ne pas les utiliser telles quelles en production — créez de nouveaux comptes et remplacez ces mots de passe.

---

## Structure du projet

```
.
├── backend/                        # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/Api/   # Contrôleurs REST (RendezVous, Ventes, Confection, Rapports, ...)
│   │   ├── Http/Middleware/        # CheckRole
│   │   └── Models/                 # Salon, User, RendezVous, Vente, Produit, Confection, Pointage, ...
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/                # Données de démonstration
│   └── routes/api.php              # Déclaration des routes API (publiques + protégées)
│
└── frontend/                       # Application React
    └── src/
        ├── app/pages/               # Pages par module (RendezVous, Ventes, Produits, Confections, ...)
        ├── app/pages/public/        # Pages de la vitrine publique
        ├── services/                 # Appels HTTP par domaine (API)
        ├── hooks/                    # Hooks React Query par module
        ├── contexts/                 # Contextes React (auth, ...)
        ├── types/                    # Types TypeScript par domaine
        └── utils/                    # Fonctions utilitaires (tokenStorage, ...)
```

---

## Scripts utiles

### Backend
```bash
php artisan test                   # Lancer les tests
php artisan migrate:fresh --seed   # Réinitialiser la base de données avec les données de démo
```

### Frontend
```bash
npm run dev       # Serveur de développement
npm run build     # Build de production (vite build)
```