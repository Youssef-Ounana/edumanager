# 🏫 Tinmel — Système de gestion d'école privée

> **Tinmel** signifie *"école"* en amazigh 🏔️

Tinmel est un logiciel SaaS de gestion d'école privée, développé avec une stack moderne. Il permet à un établissement scolaire de gérer ses élèves, classes, années scolaires, parents et paiements depuis une interface web intuitive et sécurisée.

---

## ✨ Fonctionnalités

- 🔐 **Authentification sécurisée** — JWT + Refresh Token, 6 rôles (Directeur, Comptable, Secrétaire, Enseignant, Parent, Élève)
- 🏫 **Gestion de l'école** — informations de l'établissement, configuration initiale
- 📅 **Années scolaires & classes** — création, affectation d'élèves, historique
- 👨‍🎓 **Gestion des élèves** — inscription avec parent obligatoire, fiche détaillée, modification, statut de paiement en temps réel
- 👨‍👩‍👧 **Gestion des parents** — liés aux élèves à la création, portail de connexion
- 💰 **Paiements complets** — configuration des frais, facturation, paiements partiels, reçus PDF téléchargeables
- 📊 **Tableau de bord** — statistiques financières en temps réel (total facturé, encaissé, impayés)
- 🐳 **100% Dockerisé** — déployable sur n'importe quel serveur en 30 minutes

---

## 🛠️ Stack technique

| Couche | Technologie |
|---|---|
| Backend | NestJS 10 + TypeScript |
| Base de données | PostgreSQL 15 + Prisma ORM |
| Cache | Redis 7 |
| Fichiers | MinIO (compatible S3) |
| Frontend | Next.js 16 + TypeScript |
| UI | shadcn/ui + Tailwind CSS |
| État | TanStack Query + Zustand |
| Formulaires | React Hook Form + Zod |
| PDF | PDFKit |
| Infrastructure | Docker + Docker Compose + Nginx |

---

## 📋 Prérequis

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Windows/Mac) ou Docker Engine (Linux)
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) >= 20 (développement uniquement)

---

## 🚀 Déploiement pour les écoles

> Cette section est destinée aux établissements qui souhaitent installer Tinmel sur leur propre serveur.

### Option A — Déploiement sur VPS (recommandé)

#### 1 — Prérequis serveur

Un serveur Linux (Ubuntu 22.04 recommandé) avec :
- 2 CPU minimum, 4 GB RAM
- Docker + Docker Compose installés
- Un nom de domaine pointant vers le serveur

Pour installer Docker sur Ubuntu :
```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

#### 2 — Cloner le projet

```bash
git clone https://github.com/votre-username/tinmel.git
cd tinmel
```

#### 3 — Configurer les variables d'environnement

```bash
cp .env.example .env.prod
nano .env.prod
```

Remplissez le fichier `.env.prod` :

```env
# Base de données
POSTGRES_USER=tinmel_user
POSTGRES_PASSWORD=CHOISIR_UN_MOT_DE_PASSE_FORT
POSTGRES_DB=tinmel_db

# MinIO (stockage fichiers)
MINIO_ROOT_USER=tinmel_minio
MINIO_ROOT_PASSWORD=CHOISIR_UN_MOT_DE_PASSE_FORT

# Sécurité JWT (générez des clés longues et aléatoires)
JWT_SECRET=une_cle_tres_longue_et_aleatoire_minimum_32_caracteres
JWT_REFRESH_SECRET=une_autre_cle_tres_longue_et_aleatoire_minimum_32_caracteres

# URL de votre domaine
NEXT_PUBLIC_API_URL=https://votre-domaine.com/api
```

#### 4 — Configurer SSL (HTTPS)

Placez vos certificats SSL dans le dossier `nginx/ssl/` :

```bash
mkdir -p nginx/ssl
# Copiez vos fichiers cert.pem et key.pem ici
```

Avec Let's Encrypt (gratuit) :
```bash
sudo apt install certbot
sudo certbot certonly --standalone -d votre-domaine.com
sudo cp /etc/letsencrypt/live/votre-domaine.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/votre-domaine.com/privkey.pem nginx/ssl/key.pem
```

#### 5 — Lancer Tinmel

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d
```

Attendez 1-2 minutes que tous les services démarrent, puis vérifiez :

```bash
docker compose -f docker-compose.prod.yml ps
```

Tous les services doivent être `running`.

#### 6 — Initialiser votre école

**Une seule fois** au premier lancement, créez votre école et votre compte directeur :

```bash
curl -X POST https://votre-domaine.com/api/setup \
  -H "Content-Type: application/json" \
  -d '{
    "schoolName": "Nom de votre école",
    "schoolSlug": "nom-ecole",
    "schoolEmail": "contact@votreecole.ma",
    "city": "Votre ville",
    "directorEmail": "directeur@votreecole.ma",
    "directorPassword": "VotreMotDePasse123!",
    "directorFirstName": "Prénom",
    "directorLastName": "Nom"
  }'
```

Votre application est maintenant accessible sur **https://votre-domaine.com** 🎉

---

### Option B — Déploiement local (test/démonstration)

#### 1 — Cloner et configurer

```bash
git clone https://github.com/votre-username/tinmel.git
cd tinmel
cp .env.example .env
```

#### 2 — Installer les dépendances et migrer la base de données

```bash
# Backend
cd apps/backend
npm install
npx prisma migrate dev
npx prisma generate
cd ../..

# Frontend
cd apps/frontend
npm install
cd ../..
```

#### 3 — Lancer l'infrastructure

```bash
docker compose up -d
```

#### 4 — Lancer les serveurs

**Terminal 1 — Backend :**
```bash
cd apps/backend
npm run start:dev
```

**Terminal 2 — Frontend :**
```bash
cd apps/frontend
npm run dev
```

#### 5 — Initialiser l'école

```bash
curl -X POST http://localhost:3001/api/setup \
  -H "Content-Type: application/json" \
  -d '{
    "schoolName": "Mon École",
    "schoolSlug": "mon-ecole",
    "schoolEmail": "contact@monecole.ma",
    "city": "Casablanca",
    "directorEmail": "directeur@monecole.ma",
    "directorPassword": "DirecteurPass123!",
    "directorFirstName": "Prénom",
    "directorLastName": "Nom"
  }'
```

Accédez à **http://localhost:3000** et connectez-vous avec les identifiants du directeur.

---

## 📖 Guide d'utilisation

### Première connexion

1. Accédez à votre URL Tinmel
2. Connectez-vous avec l'email et mot de passe du directeur
3. Vous arrivez sur le **tableau de bord**

---

### Étape 1 — Créer une année scolaire

1. Allez dans **Années scolaires** dans le menu
2. Remplissez le formulaire : nom (ex: `2026-2027`), date de début et fin
3. Cochez **Année courante** si c'est l'année active
4. Cliquez **Créer**

---

### Étape 2 — Créer des classes

1. Dans **Années scolaires**, cliquez sur l'année créée
2. Dans le panneau **Classes**, entrez le nom (ex: `6ème A`) et la capacité
3. Cliquez **Créer la classe**
4. Répétez pour toutes vos classes

---

### Étape 3 — Configurer les frais

Avant de créer des factures, configurez vos types de frais via l'API ou Postman :

```
POST /api/payments/fee-configs
Authorization: Bearer VOTRE_TOKEN

{
  "name": "Frais de scolarité mensuel",
  "type": "MONTHLY",
  "amount": 500,
  "dueDay": 5,
  "schoolYearId": "ID_DE_VOTRE_ANNEE"
}
```

Types disponibles : `REGISTRATION`, `MONTHLY`, `EXAM`, `TRANSPORT`, `CANTEEN`, `OTHER`

---

### Étape 4 — Inscrire un élève

1. Allez dans **Élèves**
2. Cliquez **Nouvel élève**
3. Remplissez les informations de l'élève (prénom, nom, date de naissance, genre, n° inscription)
4. Remplissez les informations du parent/contact d'urgence (obligatoire)
5. Cliquez **Créer élève + parent**

---

### Étape 5 — Affecter l'élève à une classe

1. Dans la liste des élèves, cliquez sur le crayon ✏️ de l'élève
2. Allez dans l'onglet **Classe**
3. Sélectionnez l'année scolaire puis la classe
4. Cliquez **Affecter à cette classe**

---

### Étape 6 — Créer une facture

1. Allez dans **Paiements**
2. Cliquez **Nouvelle facture**
3. Sélectionnez l'élève et le type de frais
4. Entrez la date d'échéance
5. Cliquez **Créer facture**

---

### Étape 7 — Enregistrer un paiement

1. Dans **Paiements**, trouvez la facture dans la liste
2. Cliquez **Détails** ou **Payer**
3. Entrez le montant payé (partiel ou total)
4. Choisissez la méthode (espèces, virement, chèque)
5. Cliquez **Confirmer**
6. Téléchargez le reçu PDF avec le bouton ⬇️

---

### Étape 8 — Ajouter des utilisateurs

Pour ajouter une secrétaire ou un comptable, utilisez l'API :

```
POST /api/auth/register
Authorization: Bearer VOTRE_TOKEN

{
  "email": "secretaire@votreecole.ma",
  "password": "MotDePasse123!",
  "firstName": "Prénom",
  "lastName": "Nom",
  "role": "SECRETARY",
  "schoolId": "ID_DE_VOTRE_ECOLE"
}
```

Rôles disponibles : `DIRECTOR`, `ACCOUNTANT`, `SECRETARY`, `TEACHER`, `PARENT`, `STUDENT`

---

## 🔐 Rôles et permissions

| Rôle | Ce qu'il peut faire |
|---|---|
| **DIRECTOR** | Tout — accès complet à l'établissement |
| **ACCOUNTANT** | Frais, factures, paiements, reçus |
| **SECRETARY** | Élèves, parents, classes, consultation paiements |
| **TEACHER** | Consultation élèves et classes |
| **PARENT** | Données de ses enfants uniquement |
| **STUDENT** | Ses propres données uniquement |

---

## 🐳 Commandes Docker utiles

```bash
# Démarrer tous les services
docker compose -f docker-compose.prod.yml up -d

# Arrêter tous les services
docker compose -f docker-compose.prod.yml down

# Voir le statut des services
docker compose -f docker-compose.prod.yml ps

# Voir les logs en temps réel
docker compose -f docker-compose.prod.yml logs -f

# Logs d'un service spécifique
docker compose -f docker-compose.prod.yml logs -f backend

# Redémarrer un service
docker compose -f docker-compose.prod.yml restart backend

# Mettre à jour après une nouvelle version
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 💾 Sauvegardes

Il est recommandé de sauvegarder la base de données régulièrement :

```bash
# Sauvegarder la base de données
docker exec tinmel_postgres pg_dump -U tinmel_user tinmel_db > backup_$(date +%Y%m%d).sql

# Restaurer une sauvegarde
docker exec -i tinmel_postgres psql -U tinmel_user tinmel_db < backup_20260922.sql
```

---

## 🗂️ Structure du projet

```
tinmel/
├── apps/
│   ├── backend/                # API REST — NestJS
│   │   ├── src/
│   │   │   ├── auth/           # Authentification JWT
│   │   │   ├── students/       # Gestion élèves
│   │   │   ├── parents/        # Gestion parents
│   │   │   ├── school-years/   # Années + classes
│   │   │   ├── payments/       # Finances + PDF
│   │   │   ├── schools/        # Infos école
│   │   │   ├── setup/          # Initialisation
│   │   │   └── prisma/         # Connexion BDD
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Schéma BDD (27 tables)
│   │   │   └── migrations/     # Historique migrations
│   │   └── Dockerfile
│   └── frontend/               # Interface web — Next.js
│       ├── src/
│       │   ├── app/            # Pages (App Router)
│       │   ├── components/     # Composants réutilisables
│       │   ├── hooks/          # Hooks API (TanStack Query)
│       │   ├── lib/            # Axios, Zustand, Providers
│       │   └── types/          # Types TypeScript
│       └── Dockerfile
├── nginx/
│   ├── nginx.conf              # Configuration reverse proxy
│   └── ssl/                    # Certificats SSL
├── docker-compose.yml          # Infrastructure développement
├── docker-compose.prod.yml     # Infrastructure production
├── .env.example                # Modèle variables d'environnement
└── README.md
```

---

## 🧑‍💻 Guide développeur

### Ajouter un nouveau module backend

```bash
# 1. Créer la structure
mkdir src/mon-module src/mon-module/dto

# 2. Créer les fichiers
# - mon-module.service.ts (logique métier)
# - mon-module.controller.ts (routes)
# - mon-module.module.ts (déclaration)
# - dto/create-mon-module.dto.ts (validation)

# 3. Importer dans app.module.ts
```

### Modifier le schéma de base de données

```bash
# 1. Modifier prisma/schema.prisma
# 2. Créer et appliquer la migration
npx prisma migrate dev --name description-du-changement
npx prisma generate
# 3. Ajouter les getters dans prisma.service.ts si nouvelle table
```

### Ajouter un composant UI

```bash
cd apps/frontend
npx shadcn@latest add nom-du-composant
```

### Variables d'environnement

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `JWT_SECRET` | Clé secrète pour les access tokens |
| `JWT_REFRESH_SECRET` | Clé secrète pour les refresh tokens |
| `JWT_EXPIRES_IN` | Durée de validité access token (défaut: 15m) |
| `JWT_REFRESH_EXPIRES_IN` | Durée refresh token (défaut: 7d) |
| `NEXT_PUBLIC_API_URL` | URL du backend (accessible navigateur) |
| `MINIO_ROOT_USER` | Identifiant MinIO |
| `MINIO_ROOT_PASSWORD` | Mot de passe MinIO |

---

## 🔌 API — Endpoints principaux

### Auth
| Méthode | Route | Description | Auth |
|---|---|---|---|
| POST | `/api/setup` | Initialisation école + directeur | Non |
| POST | `/api/auth/login` | Connexion | Non |
| POST | `/api/auth/logout` | Déconnexion | Oui |
| POST | `/api/auth/refresh` | Renouveler token | Oui |

### Élèves
| Méthode | Route | Description |
|---|---|---|
| GET | `/api/students` | Liste des élèves |
| POST | `/api/students` | Créer élève + parent |
| GET | `/api/students/:id` | Fiche complète |
| PUT | `/api/students/:id` | Modifier |
| DELETE | `/api/students/:id` | Supprimer |

### Années scolaires
| Méthode | Route | Description |
|---|---|---|
| POST | `/api/school-years` | Créer une année |
| GET | `/api/school-years` | Lister les années |
| PATCH | `/api/school-years/:id/set-current` | Définir comme courante |
| POST | `/api/school-years/classrooms` | Créer une classe |
| GET | `/api/school-years/:id/classrooms` | Classes d'une année |
| POST | `/api/school-years/enroll` | Inscrire élève dans une classe |

### Paiements
| Méthode | Route | Description |
|---|---|---|
| POST | `/api/payments/fee-configs` | Créer un type de frais |
| GET | `/api/payments/fee-configs` | Lister les frais |
| POST | `/api/payments/invoices` | Créer une facture |
| GET | `/api/payments/invoices` | Lister les factures |
| GET | `/api/payments/invoices/:id` | Détail facture + paiements |
| POST | `/api/payments` | Enregistrer un paiement |
| GET | `/api/payments/summary` | Résumé financier |
| GET | `/api/payments/:id/receipt` | Télécharger reçu PDF |

---

## 🐞 Résolution de problèmes

### Le site n'est pas accessible
```bash
# Vérifier que tous les conteneurs tournent
docker compose -f docker-compose.prod.yml ps

# Voir les erreurs
docker compose -f docker-compose.prod.yml logs nginx
docker compose -f docker-compose.prod.yml logs backend
```

### Erreur de connexion à la base de données
```bash
# Vérifier que PostgreSQL est healthy
docker compose -f docker-compose.prod.yml ps postgres

# Tester la connexion
docker exec tinmel_postgres pg_isready -U tinmel_user
```

### Mot de passe oublié du directeur
```bash
# Accéder au conteneur backend
docker exec -it tinmel_backend sh

# Réinitialiser via Prisma Studio (développement uniquement)
npx prisma studio
```

### Mettre à jour Tinmel
```bash
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 📅 Roadmap

### Phase 1 — MVP ✅
- Auth + RBAC complet
- Gestion élèves + parents (création combinée)
- Années scolaires + classes + affectation
- Paiements + reçus PDF
- Tableau de bord financier
- Dockerisation complète

### Phase 2 — En cours 🔄
- Page Paramètres (gestion frais depuis l'interface)
- Emploi du temps
- Export Excel des paiements
- Déploiement VPS avec Let's Encrypt

### Phase 3 — Prévu 📋
- Application mobile PWA
- Notifications email/SMS
- Module analytique avancé
- API publique

---



## 📄 Licence

MIT — libre d'utilisation, de modification et de distribution.

---

<p align="center">
  Fait avec ❤️ par <a href="https://github.com/votre-username">Youssef Ounana</a>
  <br/>
  <em>Tinmel</em>
</p>
