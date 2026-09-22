# 🏫 Tinmel — Système de gestion d'école privée

> **Tinmel** signifie *"école"* en amazigh 🏔️

Tinmel est un logiciel SaaS de gestion d'école privée, développé avec une stack moderne (NestJS · Next.js · PostgreSQL · Docker). Il permet à un établissement scolaire de gérer ses élèves, classes, années scolaires, parents et paiements depuis une interface web intuitive.

---

## ✨ Fonctionnalités

- 🔐 **Authentification** — JWT + Refresh Token, rôles (Directeur, Comptable, Secrétaire, Enseignant, Parent, Élève)
- 🏫 **Gestion de l'école** — informations de l'établissement, configuration initiale
- 📅 **Années scolaires & classes** — création, affectation d'élèves, historique
- 👨‍🎓 **Gestion des élèves** — inscription avec parent obligatoire, fiche détaillée, modification
- 👨‍👩‍👧 **Gestion des parents** — liés aux élèves, portail de connexion
- 💰 **Paiements** — configuration des frais, facturation, paiements partiels, reçus PDF
- 📊 **Tableau de bord** — statistiques financières en temps réel

---

## 🗂️ Structure du projet

```
tinmel/
├── apps/
│   ├── backend/          # API REST — NestJS
│   └── frontend/         # Interface web — Next.js
├── packages/             # Packages partagés (à venir)
├── docker-compose.yml    # Infrastructure locale
├── .env.example          # Variables d'environnement (modèle)
└── README.md
```

### Backend (`apps/backend/src/`)

```
src/
├── main.ts                     # Point d'entrée — démarre le serveur
├── app.module.ts               # Module racine — importe tous les modules
│
├── prisma/
│   ├── prisma.module.ts        # Module global Prisma (disponible partout)
│   └── prisma.service.ts       # Service de connexion à PostgreSQL
│
├── auth/
│   ├── auth.module.ts          # Module d'authentification
│   ├── auth.controller.ts      # Routes : /auth/login, /register, /logout, /refresh
│   ├── auth.service.ts         # Logique : bcrypt, JWT, refresh token
│   ├── strategies/
│   │   ├── jwt.strategy.ts         # Vérifie l'access token JWT
│   │   └── jwt-refresh.strategy.ts # Vérifie le refresh token
│   └── guards/
│       ├── jwt-auth.guard.ts   # Protège les routes (token obligatoire)
│       └── roles.guard.ts      # Vérifie le rôle de l'utilisateur
│
├── common/
│   └── decorators/
│       ├── roles.decorator.ts        # @Roles(UserRole.DIRECTOR)
│       └── current-user.decorator.ts # @CurrentUser() — injecte l'user connecté
│
├── setup/
│   └── setup.controller.ts     # POST /setup — initialise école + directeur (1 seule fois)
│
├── schools/
│   ├── schools.module.ts
│   ├── schools.controller.ts   # CRUD /schools
│   ├── schools.service.ts
│   └── dto/
│       ├── create-school.dto.ts
│       └── update-school.dto.ts
│
├── school-years/
│   ├── school-years.module.ts
│   ├── school-years.controller.ts  # Années scolaires + classes + inscription élève
│   ├── school-years.service.ts
│   └── dto/
│       ├── create-school-year.dto.ts
│       └── create-classroom.dto.ts
│
├── students/
│   ├── students.module.ts
│   ├── students.controller.ts  # CRUD /students
│   ├── students.service.ts     # Création élève + parent en transaction
│   └── dto/
│       ├── create-student.dto.ts   # Inclut CreateParentInlineDto
│       └── update-student.dto.ts
│
├── parents/
│   ├── parents.module.ts
│   ├── parents.controller.ts   # CRUD /parents
│   ├── parents.service.ts
│   └── dto/
│       └── create-parent.dto.ts
│
└── payments/
    ├── payments.module.ts
    ├── payments.controller.ts  # FeeConfigs + Invoices + Payments + reçu PDF
    ├── payments.service.ts
    ├── pdf.service.ts          # Génération reçu PDF avec PDFKit
    └── dto/
        ├── create-fee-config.dto.ts
        ├── create-invoice.dto.ts
        └── create-payment.dto.ts
```

### Frontend (`apps/frontend/src/`)

```
src/
├── app/
│   ├── layout.tsx              # Layout racine — Provider TanStack Query
│   ├── page.tsx                # Redirige vers /login
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx        # Page de connexion
│   └── (dashboard)/
│       ├── layout.tsx          # Sidebar + protection de route
│       ├── dashboard/
│       │   └── page.tsx        # Tableau de bord avec statistiques
│       ├── students/
│       │   ├── page.tsx        # Liste des élèves
│       │   └── [id]/
│       │       └── page.tsx    # Fiche détaillée d'un élève
│       ├── parents/
│       │   └── page.tsx        # Liste des parents
│       ├── school-years/
│       │   └── page.tsx        # Années scolaires + classes
│       └── payments/
│           └── page.tsx        # Factures + paiements + reçus PDF
│
├── components/
│   ├── ui/                     # Composants shadcn/ui (Button, Input, Card...)
│   ├── students/
│   │   ├── CreateStudentModal.tsx  # Modale création élève + parent
│   │   └── EditStudentModal.tsx    # Modale modification (3 onglets)
│   └── payments/
│       └── CreateInvoiceModal.tsx  # Modale création facture
│
├── hooks/
│   ├── useAuth.ts              # useLogin, useLogout
│   ├── useStudents.ts          # useStudents, useStudent, useCreateStudent...
│   └── usePayments.ts          # useFeeConfigs, useInvoices, useCreatePayment...
│
├── lib/
│   ├── axios.ts                # Instance Axios + intercepteurs JWT auto
│   ├── store.ts                # Store Zustand — état auth global
│   └── providers.tsx           # Provider TanStack Query
│
└── types/
    └── index.ts                # Types TypeScript (User, Student, Invoice...)
```

---

## 🛠️ Stack technique

| Couche | Technologie | Rôle |
|---|---|---|
| Backend | NestJS 10 + TypeScript | API REST |
| ORM | Prisma 7 + `@prisma/adapter-pg` | Accès base de données |
| Base de données | PostgreSQL 15 | Stockage principal |
| Cache | Redis 7 | Sessions, cache |
| Fichiers | MinIO | Stockage objets (PDF, photos) |
| Frontend | Next.js 16 + TypeScript | Interface web |
| UI | shadcn/ui + Tailwind CSS | Composants |
| État serveur | TanStack Query | Cache requêtes API |
| État global | Zustand | Auth, session |
| Formulaires | React Hook Form + Zod | Validation |
| PDF | PDFKit | Génération reçus |
| Auth | JWT + Refresh Token | Sécurité |
| Infrastructure | Docker + Docker Compose | Environnement local |

---

## ⚡ Installation rapide

### Prérequis

- [Node.js](https://nodejs.org/) >= 20
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

### 1 — Cloner le projet

```bash
git clone https://github.com/votre-username/tinmel.git
cd tinmel
```

### 2 — Variables d'environnement

```bash
cp .env.example .env
```

Éditez `.env` à la racine si besoin (les valeurs par défaut fonctionnent pour le développement local).

Créez aussi le fichier `.env` dans `apps/backend/` :

```env
DATABASE_URL="postgresql://tinmel_user:tinmel_pass_2026@localhost:5432/tinmel_db?schema=public"
APP_PORT=3001
JWT_SECRET=change_this_secret_key_in_production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=change_this_refresh_secret_in_production
JWT_REFRESH_EXPIRES_IN=7d
```

### 3 — Lancer l'infrastructure Docker

```bash
docker compose up -d
```

Cela démarre :
- **PostgreSQL** sur le port `5432`
- **Redis** sur le port `6379`
- **MinIO** sur les ports `9000` (API) et `9001` (interface web)
- **pgAdmin** sur le port `5050`

### 4 — Installer les dépendances et migrer la base de données

```bash
# Backend
cd apps/backend
npm install
npx prisma migrate dev
npx prisma generate

# Frontend
cd ../frontend
npm install
```

### 5 — Lancer les serveurs

Ouvrez **deux terminaux** :

**Terminal 1 — Backend :**
```bash
cd apps/backend
npm run start:dev
# API disponible sur http://localhost:3001/api
```

**Terminal 2 — Frontend :**
```bash
cd apps/frontend
npm run dev
# Interface disponible sur http://localhost:3000
```

### 6 — Initialiser l'école

Au premier lancement, créez l'école et le directeur via l'API :

```bash
curl -X POST http://localhost:3001/api/setup \
  -H "Content-Type: application/json" \
  -d '{
    "schoolName": "Mon École",
    "schoolSlug": "mon-ecole",
    "schoolEmail": "contact@monecole.ma",
    "city": "Casablanca",
    "directorEmail": "directeur@monecole.ma",
    "directorPassword": "MonMotDePasse123!",
    "directorFirstName": "Prénom",
    "directorLastName": "Nom"
  }'
```

Connectez-vous ensuite sur **http://localhost:3000** avec les identifiants du directeur.

---

## 🔌 API — Endpoints principaux

### Authentification
| Méthode | Route | Description |
|---|---|---|
| POST | `/api/auth/login` | Connexion |
| POST | `/api/auth/logout` | Déconnexion |
| POST | `/api/auth/refresh` | Renouveler le token |

### Élèves
| Méthode | Route | Description |
|---|---|---|
| GET | `/api/students` | Liste des élèves |
| POST | `/api/students` | Créer élève + parent |
| GET | `/api/students/:id` | Fiche élève |
| PUT | `/api/students/:id` | Modifier élève |
| DELETE | `/api/students/:id` | Supprimer élève |

### Années scolaires & classes
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
| POST | `/api/payments` | Enregistrer un paiement |
| GET | `/api/payments/summary` | Résumé financier |
| GET | `/api/payments/:id/receipt` | Télécharger le reçu PDF |

---

## 🔐 Rôles et permissions

| Rôle | Périmètre |
|---|---|
| **DIRECTOR** | Accès complet à l'établissement |
| **ACCOUNTANT** | Module financier uniquement |
| **SECRETARY** | Administration (élèves, classes) |
| **TEACHER** | Consultation de ses classes |
| **PARENT** | Données de ses enfants |
| **STUDENT** | Ses propres données |

---

## 🧑‍💻 Guide développeur

### Ajouter un nouveau module

1. **Créer le dossier** : `src/mon-module/`
2. **Créer les DTOs** : `src/mon-module/dto/`
3. **Créer le service** : logique métier + appels Prisma
4. **Créer le controller** : routes + guards + décorateurs
5. **Créer le module** : déclarer service et controller
6. **Importer dans `app.module.ts`**

Exemple minimal :

```typescript
// mon-module.service.ts
@Injectable()
export class MonModuleService {
  constructor(private prisma: PrismaService) {}

  async findAll(schoolId: string) {
    return this.prisma.maTable.findMany({ where: { schoolId } })
  }
}

// mon-module.controller.ts
@Controller('mon-module')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MonModuleController {
  constructor(private service: MonModuleService) {}

  @Get()
  @Roles(UserRole.DIRECTOR)
  findAll(@CurrentUser('schoolId') schoolId: string) {
    return this.service.findAll(schoolId)
  }
}
```

### Ajouter un modèle Prisma

1. Ajouter le modèle dans `prisma/schema.prisma`
2. Lancer la migration :
```bash
npx prisma migrate dev --name nom-de-la-migration
npx prisma generate
```
3. Exposer les getters dans `src/prisma/prisma.service.ts`

### Ajouter un composant UI (shadcn)

```bash
cd apps/frontend
npx shadcn@latest add nom-du-composant
```

### Ajouter un hook API

```typescript
// src/hooks/useMonModule.ts
export function useMonModule() {
  return useQuery({
    queryKey: ['mon-module'],
    queryFn: async () => {
      const response = await api.get('/mon-module')
      return response.data
    },
  })
}
```

---

## 🐳 Services Docker

| Service | Port | URL | Identifiants |
|---|---|---|---|
| PostgreSQL | 5432 | — | `tinmel_user` / `tinmel_pass_2026` |
| Redis | 6379 | — | — |
| MinIO | 9001 | http://localhost:9001 | `tinmel_minio` / `minio_pass_2026` |
| pgAdmin | 5050 | http://localhost:5050 | `admin@tinmel.com` / `pgadmin_pass_2026` |

**Commandes utiles :**
```bash
docker compose up -d      # Démarrer
docker compose down       # Arrêter
docker compose ps         # Statut
docker compose logs -f    # Logs en temps réel
```

---

## 📁 Fichiers importants

| Fichier | Rôle |
|---|---|
| `docker-compose.yml` | Infrastructure locale (PostgreSQL, Redis, MinIO, pgAdmin) |
| `.env.example` | Modèle de variables d'environnement |
| `apps/backend/.env` | Variables du backend (ne pas commiter) |
| `apps/backend/prisma/schema.prisma` | Schéma de la base de données |
| `apps/backend/prisma/migrations/` | Historique des migrations SQL |
| `apps/backend/prisma.config.ts` | Configuration Prisma 7 |
| `apps/frontend/src/lib/axios.ts` | Client HTTP avec gestion JWT automatique |
| `apps/frontend/src/lib/store.ts` | État global (Zustand) |

---

## 🚀 Déploiement (production)

> Documentation complète à venir — Phase 2

Étapes prévues :
1. Dockeriser le backend et le frontend
2. Configurer Nginx comme reverse proxy
3. Déployer sur un VPS (Ubuntu)
4. Configurer les certificats SSL (Let's Encrypt)
5. Mettre en place les sauvegardes PostgreSQL

---

## 📋 Roadmap

### Phase 1 — MVP ✅ (terminé)
- Auth + RBAC
- Gestion élèves + parents
- Années scolaires + classes
- Paiements + reçus PDF

### Phase 2 — En cours
- Emploi du temps
- Export Excel des paiements
- Page Paramètres (frais, école)
- Dockerisation production
- Déploiement VPS

### Phase 3 — Prévu
- Application mobile PWA
- Module analytique
- API publique

---

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Forkez le projet
2. Créez une branche : `git checkout -b feat/ma-fonctionnalite`
3. Commitez : `git commit -m "feat: ma fonctionnalité"`
4. Pushez : `git push origin feat/ma-fonctionnalite`
5. Ouvrez une Pull Request

---

## 📄 Licence

MIT — libre d'utilisation, de modification et de distribution.

---

<p align="center">
  Fait avec ❤️ par <a href="https://github.com/votre-username">Youssef Ounana</a>
  <br/>
  <em>Tinmel — "école" en amazigh 🏔️</em>
</p>