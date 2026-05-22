# Rapport Technique Backend — TPE INF438

**Destiné aux :** Développeurs Frontend  
**Auteur :** AlbertCanCode  
**Date :** Mai 2026  
**Version API :** 1.0.0  

---

## Sommaire

1. [Architecture Générale](#1-architecture-générale)
2. [Prérequis & Lancement du Backend](#2-prérequis--lancement-du-backend)
3. [Authentification & Sécurité](#3-authentification--sécurité)
4. [Structure Générale des Réponses API](#4-structure-générale-des-réponses-api)
5. [Endpoints Core Stats (Route `/stats`)](#5-endpoints-core-stats)
6. [Endpoints Advanced Analytics (Route `/analytics`)](#6-endpoints-advanced-analytics)
7. [Endpoints Prédiction ML (Route `/predict`)](#7-endpoints-prédiction-ml)
8. [Endpoints Authentification (Route `/auth`)](#8-endpoints-authentification)
9. [Endpoints Administration (Route `/admin`)](#9-endpoints-administration)
10. [Guide d'Intégration Frontend](#10-guide-dintégration-frontend)
11. [Codes d'Erreur & Gestion des Cas Limites](#11-codes-derreur--gestion-des-cas-limites)
12. [Annexe : Exemples Concrets d'Appels](#12-annexe--exemples-concrets-dappels)

---

## 1. Architecture Générale

```
Frontend (React/Vite) ──HTTP / JSON──► Backend (NestJS) ──JDBC──► Databricks SQL Warehouse
                                              │
                                              ├── Cache Redis (optionnel)
                                              ├── JWT Auth / Passport
                                              └── ML API Python (FastAPI) pour prédictions
```

### Stack Technique Backend

| Couche          | Technologie                          |
|-----------------|--------------------------------------|
| Framework       | NestJS 10                            |
| Langage         | TypeScript 5                         |
| Base de données | Databricks SQL Warehouse (Apache Spark SQL) |
| Cache           | Redis (via `cache-manager`)          |
| Auth            | JWT (JSON Web Token) + Passport.js   |
| Validation      | `class-validator` + `class-transformer` |
| Rate Limiting   | `@nestjs/throttler` (100 req/min)    |
| Sécurité        | Helmet (CORS configuré)              |

### Structure des Tables Databricks

Le backend interroge 3 tables Databricks :

| Table          | Alias | Description                          |
|----------------|-------|--------------------------------------|
| `train_clean`   | `T`   | Transactions de ventes (80M+ lignes) |
| `items_clean`   | `I`   | Catalogue produits (item_nbr → family) |
| `stores_clean`  | `S`   | Informations magasins (store_nbr → type, city) |

### Structure du Code Backend

```
backend/src/
├── main.ts                          # Point d'entrée NestJS
├── app.module.ts                    # Module racine (DI, contrôleurs, providers)
├── application/
│   ├── dto/                         # Data Transfer Objects (validés)
│   │   ├── request/                 #   DateRangeRequest, CategoryFilterRequest
│   │   └── response/                #   ApiResponse, PaginatedApiResponse, ErrorResponse
│   └── use-cases/                   # Cas d'utilisation métier
│       ├── AuthService.ts           #   Auth, JWT, gestion utilisateurs
│       ├── GetGlobalStatsUseCase.ts
│       ├── GetTemporalStatsUseCase.ts
│       ├── GetCategoryStatsUseCase.ts
│       └── GetStoreStatsUseCase.ts
├── core/
│   ├── domain/
│   │   ├── entities/                # Entités métier (GlobalStats, TemporalData, etc.)
│   │   ├── ports/in/                # Interfaces des use-cases
│   │   └── ports/out/               # Interface IStatsRepository
│   └── exceptions/                  # DatabricksConnectionException
├── infrastructure/
│   └── adapters/
│       ├── persistence/databricks/  # DatabricksRepository (implémentation JDBC)
│       ├── security/                # JwtAuthGuard, JwtStrategy
│       └── ...
├── presentation/
│   └── controllers/                 # Contrôleurs HTTP (5 contrôleurs)
├── cache/                           # Module Redis optionnel
└── databricks/                      # Module Databricks (interfaces/dto)
```

---

## 2. Prérequis & Lancement du Backend

### 2.1 Prérequis Système

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **Accès Databricks** (les credentials sont déjà fournis dans `.env`)
- **Redis** : optionnel — le backend fonctionne sans, le cache sera simplement désactivé

### 2.2 Fichier de Configuration `.env`

Le fichier `backend/.env` contient toute la configuration. **Ne pas le modifier sans coordination.**

```env
# === Databricks ===
DATABRICKS_HOST="dbc-e67c549e-8618.cloud.databricks.com"
DATABRICKS_PATH="/sql/1.0/warehouses/a5188323032d817b"
DATABRICKS_TOKEN="dapid4194e2519b14da62dc1e8d4cd42f964"
DATABRICKS_CATALOG="workspace"
DATABRICKS_SCHEMA="default"
TABLE_TRAIN="train"
TABLE_ITEMS="items"
TABLE_STORES="stores"

# === Server ===
PORT=3000
NODE_ENV=development

# === JWT (optionnel — valeurs par défaut dans le code) ===
JWT_SECRET=super-secret-key-change-in-production

# === Redis Cache (optionnel) ===
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_TTL=300

# === Cache TTLs ===
API_PREFIX=api/v1
CACHE_TTL_GLOBAL=900
CACHE_TTL_TEMPORAL=600
CACHE_TTL_CATEGORIES=900
CACHE_TTL_STORES=900

# === ML Prediction API ===
ML_API_URL=http://localhost:8000
```

### 2.3 Installation & Démarrage

```bash
# 1. Se placer dans le dossier backend
cd backend

# 2. Installer les dépendances
npm install

# 3. Lancer en mode développement (avec watch — recommandé)
npm run start:dev

# 4. Lancer en mode production
npm run build
npm run start:prod
```

Le serveur démarre sur **http://localhost:3000**.

### 2.4 Vérifier que le Backend est Opérationnel

```bash
curl http://localhost:3000/stats/health
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2026-05-20T15:00:00.000Z",
    "uptime": 123.45
  },
  "timestamp": "2026-05-20T15:00:00.000Z",
  "version": "1.0.0"
}
```

### 2.5 Configuration CORS

Le backend accepte les requêtes depuis `http://localhost:5173` (Vite dev server par défaut).  
Si le frontend est servi depuis une autre URL, configurer `FRONTEND_URL` dans `.env`.

---

## 3. Authentification & Sécurité

### 3.1 Mécanisme JWT (JSON Web Token)

Le backend utilise deux tokens :

| Token        | Durée de vie | Usage                                      |
|--------------|--------------|--------------------------------------------|
| Access Token | 15 minutes   | Inclus dans chaque requête API (`Authorization: Bearer ...`) |
| Refresh Token| 7 jours      | Stocké côté frontend pour obtenir un nouvel access token |

### 3.2 Compte Admin Pré-initialisé

| Champ          | Valeur                        |
|----------------|-------------------------------|
| Email          | `admin@retailsense.ai`        |
| Mot de passe   | `admin123`                    |
| Rôle           | `admin`                       |

⏰ Le compte est créé **au démarrage** du serveur (dans une Map mémoire). Si le serveur redémarre, les comptes créés sont perdus. **À remplacer par une base de données en production.**

### 3.3 Rôles & Permissions

| Rôle      | Description                          | Droits                                  |
|-----------|--------------------------------------|-----------------------------------------|
| `admin`   | Accès total + gestion des utilisateurs | Lecture/écriture, CRUD users           |
| `analyst` | Analyste de données                   | Lecture toutes stats + prédictions      |
| `viewer`  | Consultation seule                    | Lecture stats uniquement                |

> **Note technique :** Actuellement, le guard JWT ne fait qu'une validation de token — les rôles ne sont pas strictement enforceés au niveau des endpoints individuels. À améliorer si nécessaire.

### 3.4 Flux d'Authentification Complet

```
1. POST /auth/login
   → { accessToken, refreshToken, user }

2. Stocker dans localStorage :
   - accessToken  → localStorage.setItem('accessToken', token)
   - refreshToken → localStorage.setItem('refreshToken', token)
   - user         → localStorage.setItem('user', JSON.stringify(user))

3. Chaque requête API :
   headers: { 'Authorization': `Bearer ${accessToken}` }

4. En cas de 401 :
   - Appeler POST /auth/refresh avec { refreshToken }
   - Si succès → remplacer accessToken, retenter la requête originale
   - Si échec → rediriger vers la page de login

5. À l'initialisation de l'app :
   - Vérifier si un token existe dans localStorage
   - Si oui, décoder le JWT (sans validation serveur) pour obtenir le profil
   - Utiliser l'appel GET /auth/profile si besoin de fraîcheur
```

### 3.5 Rate Limiting

- **100 requêtes par minute** par IP
- Protection contre les abus implémentée via `@nestjs/throttler`
- L'API `/stats/health` n'est **pas** limitée

---

## 4. Structure Générale des Réponses API

### 4.1 Réponse Succès (enveloppe standard)

Toutes les réponses sont automatiquement formatées par le **ResponseInterceptor** global :

```json
{
  "success": true,
  "data": { /* ... les données réelles ... */ },
  "timestamp": "2026-05-20T15:00:00.000Z",
  "version": "1.0.0"
}
```

> **Important Frontend :** Le `data` contient soit un objet unique, soit un tableau selon l'endpoint.

### 4.2 Réponse Erreur

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired JWT token",
    "details": null
  },
  "timestamp": "2026-05-20T15:00:00.000Z"
}
```

### 4.3 En-têtes Requis

| Header            | Valeur              | Obligatoire                          |
|-------------------|---------------------|--------------------------------------|
| `Content-Type`    | `application/json`  | Oui (toutes les requêtes avec body)  |
| `Authorization`   | `Bearer <token>`    | Oui (sauf auth/register/login/health) |

---

## 5. Endpoints Core Stats

**Base URL :** `/stats`  
**Guard :** `JwtAuthGuard` sauf `/stats/health`  
**Interceptor :** `ResponseInterceptor` (réponse enveloppée dans `{ success, data, timestamp, version }`)

### 5.1 `GET /stats/global`

Statistiques globales de la plateforme — agrégation sur toutes les ventes (80M+ lignes).

- **Paramètres :** Aucun
- **Cache :** Oui (TTL 900s)

**Réponse (dans `data`) :**
```json
{
  "totalRevenue": 184279362.50,
  "totalVolume": 25000000,
  "promotionImpact": 42500000.00,
  "promotionPercentage": 23.06,
  "transactionCount": 25000000
}
```

| Champ               | Type   | Description                                |
|---------------------|--------|--------------------------------------------|
| `totalRevenue`      | number | Chiffre d'affaires total                   |
| `totalVolume`       | number | Nombre total de transactions               |
| `promotionImpact`   | number | Ventes générées sous promotion             |
| `promotionPercentage`| number| % des ventes faites en promotion           |
| `transactionCount`  | number | (redondant avec totalVolume pour l'instant)|

### 5.2 `GET /stats/temporal`

Statistiques temporelles agrégées par année, mois et jour de la semaine.

- **Paramètres (Query String) :**

| Nom     | Type   | Requis | Description           |
|---------|--------|--------|-----------------------|
| `year`  | number | Non    | Filtrer par année     |
| `month` | number | Non    | Filtrer par mois (1-12) |

- **Cache :** Oui (TTL 600s)

**Réponse (dans `data` — tableau) :**
```json
[
  {
    "annee": 2015,
    "mois": 1,
    "jour_semaine": 4,
    "ventes": 18427936.25
  }
]
```

| Champ           | Type   | Description                              |
|-----------------|--------|------------------------------------------|
| `annee`         | number | Année                                    |
| `mois`          | number | Mois (1-12)                              |
| `jour_semaine`  | number | Jour de la semaine (1=Dimanche, 7=Samedi)|
| `ventes`        | number | Total des ventes pour ce groupe          |

### 5.3 `GET /stats/categories`

Top catégories de produits par chiffre d'affaires avec part de marché (%).

- **Paramètres :**

| Nom     | Type   | Requis | Défaut | Description              |
|---------|--------|--------|--------|--------------------------|
| `limit` | number | Non    | 10     | Nombre de catégories     |

- **Cache :** Oui (TTL 900s)

**Réponse (dans `data` — tableau) :**
```json
[
  {
    "categorie_groupe": "GROCERY I",
    "totalSales": 82462500.00,
    "percentage": 44.73,
    "transactionCount": 8500000
  }
]
```

| Champ               | Type   | Description                            |
|---------------------|--------|----------------------------------------|
| `categorie_groupe`  | string | Nom de la catégorie (family)           |
| `totalSales`        | number | Chiffre d'affaires total               |
| `percentage`        | number | Part de marché (%)                     |
| `transactionCount`  | number | Nombre de transactions                 |

### 5.4 `GET /stats/stores`

Top magasins par performance (groupés par type et ville).

- **Paramètres :**

| Nom     | Type   | Requis | Défaut | Description          |
|---------|--------|--------|--------|----------------------|
| `limit` | number | Non    | 10     | Nombre de résultats  |

- **Cache :** Oui (TTL 900s)

**Réponse (dans `data` — tableau) :**
```json
[
  {
    "type_magasin": "SUPERMARKET",
    "ville": "Quito",
    "totalSales": 15250000.00,
    "storeCount": 5
  }
]
```

| Champ           | Type   | Description                        |
|-----------------|--------|------------------------------------|
| `type_magasin`  | string | Type de magasin                    |
| `ville`         | string | Ville                              |
| `totalSales`    | number | Ventes totales                     |
| `storeCount`    | number | Nombre de magasins dans ce groupe  |

### 5.5 `GET /stats/health`

Health check du backend. **Aucune authentification requise.**

**Réponse (brute, sans wrapper) :**
```json
{
  "status": "ok",
  "timestamp": "2026-05-20T15:00:00.000Z",
  "uptime": 1234.56
}
```

---

## 6. Endpoints Advanced Analytics

**Base URL :** `/analytics`  
**Guard :** `JwtAuthGuard`  
**Interceptor :** `ResponseInterceptor` (sauf `/analytics/custom-query` qui retourne son propre format)

> **Important :** Ces endpoints exécutent des requêtes SQL directes sur Databricks. Contrairement aux endpoints `/stats`, ils ne passent pas par le cache applicatif et les entités métier — les noms de champs retournés sont ceux des colonnes SQL (snake_case).

### 6.1 Paramètres Communs

Tous les endpoints d'analytics acceptent ces paramètres de filtrage via **query string** :

| Nom         | Type   | Exemple         | Description                                |
|-------------|--------|-----------------|--------------------------------------------|
| `store_nbr` | string | `"1"`           | Filtrer par magasin (ID string)            |
| `item_nbr`  | string | `"103665"`      | Filtrer par produit (ID string)            |
| `family`    | string | `"GROCERY I"`   | Filtrer par catégorie de produit           |
| `startDate` | string | `"2015-01-01"`  | Date de début (format `YYYY-MM-DD`)        |
| `endDate`   | string | `"2016-12-31"`  | Date de fin (format `YYYY-MM-DD`)          |
| `limit`     | number | `20`            | Nombre max de résultats (1-100)            |
| `year`      | number | `2015`          | Filtrer par année                          |
| `months`    | number | `12`            | Fenêtre de mois pour les tendances (1-60)  |

### 6.2 `GET /analytics/sales-by-dayofweek`

Distribution des ventes par jour de la semaine. Idéal pour un graphique en barres ou radar.

- **Filtres supportés :** store_nbr, item_nbr, family, startDate, endDate

**Réponse (tableau) :**
```json
[
  { "jour_semaine": 1, "total_sales": 2512345.50, "transactions": 350000 },
  { "jour_semaine": 2, "total_sales": 2789345.75, "transactions": 390000 },
  { "jour_semaine": 3, "total_sales": 2654321.20, "transactions": 375000 },
  { "jour_semaine": 4, "total_sales": 2712345.80, "transactions": 382000 },
  { "jour_semaine": 5, "total_sales": 2987654.30, "transactions": 410000 },
  { "jour_semaine": 6, "total_sales": 3345678.90, "transactions": 445000 },
  { "jour_semaine": 7, "total_sales": 2890123.40, "transactions": 398000 }
]
```

| Champ          | Type   | Description                          |
|----------------|--------|--------------------------------------|
| `jour_semaine` | number | Jour (1=Dimanche → 7=Samedi)         |
| `total_sales`  | number | Ventes totales pour ce jour          |
| `transactions`  | number | Nombre de transactions               |

**⚠️ NOTE IMPORTANTE sur l'appel existant du frontend :**  
Le fichier `frontend/src/services/api.ts` appelle `/analytics/sales-by-day` (sans "ofweek").  
**L'endpoint réel est `/analytics/sales-by-dayofweek`.**  
→ **Correction nécessaire dans le frontend :** `sales-by-day` → `sales-by-dayofweek`.

### 6.3 `GET /analytics/sales-by-month`

Ventes mensuelles groupées par année et mois. Idéal pour un graphique en barres.

- **Filtres supportés :** store_nbr, item_nbr, startDate, endDate, year

**Réponse (tableau) :**
```json
[
  { "annee": 2015, "mois": 1, "total_sales": 1523456.50, "transactions": 210000 },
  { "annee": 2015, "mois": 2, "total_sales": 1489012.30, "transactions": 205000 }
]
```

| Champ          | Type   | Description              |
|----------------|--------|--------------------------|
| `annee`        | number | Année                    |
| `mois`         | number | Mois (1-12)              |
| `total_sales`  | number | Ventes totales           |
| `transactions` | number | Nombre de transactions   |

### 6.4 `GET /analytics/sales-by-year`

Ventes annuelles avec valeur moyenne par transaction.

- **Filtres supportés :** store_nbr, item_nbr, family, startDate, endDate

**Réponse (tableau) :**
```json
[
  { "annee": 2015, "total_sales": 89234567.20, "transactions": 12500000, "avg_sale": 7.14 },
  { "annee": 2016, "total_sales": 90123456.80, "transactions": 12750000, "avg_sale": 7.07 }
]
```

| Champ          | Type   | Description                          |
|----------------|--------|--------------------------------------|
| `annee`        | number | Année                                |
| `total_sales`  | number | Ventes totales                       |
| `transactions` | number | Nombre de transactions               |
| `avg_sale`     | number | Montant moyen par transaction        |

### 6.5 `GET /analytics/promotion-impact`

Analyse d'impact des promotions. Compare ventes avec/sans promo, inclut écart-type.

- **Filtres supportés :** store_nbr, item_nbr, family, startDate, endDate

**Réponse (tableau — 2 lignes) :**
```json
[
  {
    "en_promotion": true,
    "total_sales": 42500000.00,
    "transactions": 4500000,
    "avg_sale": 9.44,
    "std_sale": 12.30
  },
  {
    "en_promotion": false,
    "total_sales": 141779362.50,
    "transactions": 20500000,
    "avg_sale": 6.92,
    "std_sale": 8.15
  }
]
```

| Champ           | Type    | Description                              |
|-----------------|---------|------------------------------------------|
| `en_promotion`  | boolean | `true` = en promotion, `false` = sans    |
| `total_sales`   | number  | Ventes totales                           |
| `transactions`  | number  | Nombre de transactions                   |
| `avg_sale`      | number  | Montant moyen par transaction            |
| `std_sale`      | number  | Écart-type (volatilité des ventes)       |

### 6.6 `GET /analytics/top-products`

Top produits les plus vendus avec fréquence d'achat.

- **Filtres supportés :** store_nbr, item_nbr, family, startDate, endDate, limit (défaut=10, max=100)

**Réponse (tableau) :**
```json
[
  {
    "item_id": "103665",
    "total_sales": 523456.50,
    "frequency": 72000,
    "avg_sale": 7.27
  }
]
```

| Champ         | Type   | Description                         |
|---------------|--------|-------------------------------------|
| `item_id`     | string | ID du produit                       |
| `total_sales`  | number | Ventes totales                     |
| `frequency`   | number | Nombre d'occurrences d'achat        |
| `avg_sale`    | number | Montant moyen par vente             |

### 6.7 `GET /analytics/top-stores`

Top magasins les plus performants avec type et ville.

- **Filtres supportés :** store_nbr, item_nbr, startDate, endDate, limit (1-100)

**Réponse (tableau) :**
```json
[
  {
    "store_id": "1",
    "type_magasin": "SUPERMARKET",
    "ville": "Quito",
    "total_sales": 3050000.50,
    "avg_sale": 8.12
  }
]
```

| Champ          | Type   | Description              |
|----------------|--------|--------------------------|
| `store_id`     | string | ID du magasin            |
| `type_magasin` | string | Type (SUPERMARKET, GROCERY, etc.) |
| `ville`        | string | Ville                    |
| `total_sales`  | number | Ventes totales           |
| `avg_sale`     | number | Montant moyen par vente  |

### 6.8 `GET /analytics/sales-trend`

Tendance des ventes mensuelles sur N mois avec moyenne quotidienne. Idéal pour un graphique de série temporelle (line chart).

- **Filtres supportés :** store_nbr, item_nbr, months (défaut=12, max=60)

**Réponse (tableau) :**
```json
[
  {
    "annee": 2015,
    "mois": 7,
    "total_sales": 1543245.80,
    "daily_avg": 49782.12,
    "transaction_days": 31
  }
]
```

| Champ             | Type   | Description                          |
|-------------------|--------|--------------------------------------|
| `annee`           | number | Année                                |
| `mois`            | number | Mois (1-12)                          |
| `total_sales`     | number | Ventes totales du mois               |
| `daily_avg`       | number | Ventes moyennes par jour             |
| `transaction_days`| number | Nombre de jours avec transactions    |

### 6.9 `GET /analytics/category-performance`

Performance détaillée par catégorie avec part de revenus (%). Jointure avec la table items.

- **Filtres supportés :** store_nbr, startDate, endDate

**Réponse (tableau) :**
```json
[
  {
    "categorie_groupe": "GROCERY I",
    "total_sales": 82462500.00,
    "transactions": 8500000,
    "avg_transaction": 9.70,
    "revenue_share": 44.73
  }
]
```

| Champ              | Type   | Description                            |
|--------------------|--------|----------------------------------------|
| `categorie_groupe` | string | Nom de la catégorie (family)           |
| `total_sales`      | number | Ventes totales                         |
| `transactions`     | number | Nombre de transactions                 |
| `avg_transaction`  | number | Montant moyen par transaction          |
| `revenue_share`    | number | Part du chiffre d'affaires total (%)   |

### 6.10 `GET /analytics/store-type-comparison`

Comparaison des performances entre types de magasins (ventes par magasin, nombre de magasins).

- **Filtres supportés :** item_nbr, startDate, endDate

**Réponse (tableau) :**
```json
[
  {
    "type_magasin": "SUPERMARKET",
    "store_count": 28,
    "total_sales": 125000000.00,
    "avg_sales_per_store": 24.50,
    "sales_per_location": 4464285.71
  }
]
```

| Champ                 | Type   | Description                              |
|-----------------------|--------|------------------------------------------|
| `type_magasin`        | string | Type de magasin                          |
| `store_count`         | number | Nombre de magasins de ce type            |
| `total_sales`         | number | Ventes totales pour ce type              |
| `avg_sales_per_store` | number | Vente moyenne par transaction pour ce type|
| `sales_per_location`  | number | Ventes totales / nombre de magasins      |

### 6.11 `GET /analytics/city-performance`

Performance des magasins par ville avec type et moyenne.

- **Filtres supportés :** item_nbr, startDate, endDate

**Réponse (tableau) :**
```json
[
  {
    "ville": "Quito",
    "type_magasin": "SUPERMARKET",
    "stores": 5,
    "total_sales": 15250000.00,
    "avg_sale": 22.50
  }
]
```

| Champ          | Type   | Description                     |
|----------------|--------|---------------------------------|
| `ville`        | string | Ville                           |
| `type_magasin` | string | Type de magasin                 |
| `stores`       | number | Nombre de magasins dans cette ville |
| `total_sales`  | number | Ventes totales                  |
| `avg_sale`     | number | Montant moyen par vente         |

### 6.12 `GET /analytics/holiday-effect`

Analyse du comportement des ventes par jour de la semaine avec distinction promo/non-promo.

- **Filtres supportés :** store_nbr, item_nbr, family, startDate, endDate

**Réponse (tableau — 7 lignes) :**
```json
[
  {
    "jour_semaine": 1,
    "promo_avg": 11.25,
    "non_promo_avg": 6.50,
    "overall_avg": 7.80
  }
]
```

| Champ           | Type   | Description                                |
|-----------------|--------|--------------------------------------------|
| `jour_semaine`  | number | Jour de la semaine (1=Dimanche→7=Samedi)   |
| `promo_avg`     | number | Montant moyen des ventes en promotion      |
| `non_promo_avg` | number | Montant moyen des ventes sans promotion    |
| `overall_avg`   | number | Montant moyen global                       |

### 6.13 `GET /analytics/inventory-insights`

Insights pour la gestion des stocks par catégorie : volatilité et niveau de sécurité suggéré.

- **Filtres supportés :** store_nbr, startDate, endDate

**Réponse (tableau) :**
```json
[
  {
    "categorie_groupe": "BEVERAGES",
    "avg_daily_sales": 1250.50,
    "sales_volatility": 342.75,
    "safety_stock_level": 1936.00
  }
]
```

| Champ               | Type   | Description                                      |
|---------------------|--------|--------------------------------------------------|
| `categorie_groupe`  | string | Nom de la catégorie                              |
| `avg_daily_sales`   | number | Ventes quotidiennes moyennes                     |
| `sales_volatility`  | number | Écart-type des ventes (volatilité)               |
| `safety_stock_level`| number | Stock de sécurité = avg + 2 × stddev             |

### 6.14 `GET /analytics/seasonal-patterns`

Analyse des patterns saisonniers : performance moyenne par mois avec volatilité et impact promo.

- **Filtres supportés :** store_nbr, item_nbr, family, startDate, endDate

**Réponse (tableau — 12 lignes) :**
```json
[
  {
    "mois": 1,
    "avg_sales": 31245.80,
    "volatility": 5678.90,
    "promo_performance": 14567.30
  }
]
```

| Champ              | Type   | Description                              |
|--------------------|--------|------------------------------------------|
| `mois`             | number | Mois (1-12)                              |
| `avg_sales`        | number | Ventes moyennes                          |
| `volatility`       | number | Écart-type des ventes                    |
| `promo_performance`| number | Ventes moyennes des produits en promotion|

### 6.15 `GET /analytics/full-dashboard`

Endpoint **composite** qui exécute 6 requêtes Databricks en parallèle et retourne un objet unique. Idéal pour charger un tableau de bord complet en un seul appel.

- **Filtres supportés :** store_nbr, startDate, endDate

**Réponse (objet) :**
```json
{
  "globalStats": {
    "totalRevenue": 184279362.50,
    "totalVolume": 25000000,
    "promotionImpact": 42500000.00,
    "promotionPercentage": 23.06
  },
  "categoryPerformance": [
    { "categorie_groupe": "GROCERY I", "total_sales": 82462500.00, "share": 44.73 }
  ],
  "monthlyTrend": [
    { "annee": 2015, "mois": 1, "sales": 1523456.50 }
  ],
  "storeComparison": [
    { "type_magasin": "SUPERMARKET", "sales": 125000000.00 }
  ],
  "promotionImpact": [
    { "en_promotion": true, "total_sales": 42500000.00, "count": 4500000 }
  ],
  "topProducts": [
    { "item_id": "103665", "sales": 523456.50 }
  ],
  "generatedAt": "2026-05-20T15:00:00.000Z"
}
```

### 6.16 `GET /analytics/custom-query`

Endpoint permettant d'exécuter une requête SQL arbitraire (en lecture seule).

| Param | Type   | Requis | Description                         |
|-------|--------|--------|-------------------------------------|
| `sql` | string | Oui    | Requête SQL (max 2000 caractères)   |

**Contraintes de sécurité :**
- Seules les requêtes commençant par `SELECT` ou `WITH` sont autorisées
- Longueur maximale : 2000 caractères
- Pas de middleware `ResponseInterceptor` (réponse brute)

**Réponse :**
```json
{
  "results": [ /* ... lignes de résultats ... */ ],
  "rowCount": 42
}
```

**En cas d'erreur :**
```json
{
  "error": "Only SELECT/WITH queries are allowed"
}
```

---

## 7. Endpoints Authentification

**Base URL :** `/auth`  
**Guard :** Variable selon l'endpoint  
**Interceptor :** `ResponseInterceptor`

### 7.1 `POST /auth/register`

Créer un nouveau compte utilisateur.

**Body (JSON) :**
```json
{
  "email": "user@example.com",
  "password": "monmotdepasse",
  "name": "Jean Dupont"
}
```

**Validation :**
| Champ      | Contrainte              |
|------------|-------------------------|
| `email`    | Format email valide     |
| `password` | Minimum 6 caractères    |
| `name`     | Chaîne non vide         |

**Réponse :**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Jean Dupont",
  "role": "viewer",
  "createdAt": "2026-05-20T...",
  "lastLogin": null,
  "isActive": true
}
```

### 7.2 `POST /auth/login`

Authentification et récupération des tokens JWT.

**Body (JSON) :**
```json
{
  "email": "admin@retailsense.ai",
  "password": "admin123"
}
```

**Réponse :**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "admin@retailsense.ai",
    "name": "Super Admin",
    "role": "admin",
    "createdAt": "2026-05-20T...",
    "lastLogin": "2026-05-20T...",
    "isActive": true
  }
}
```

### 7.3 `POST /auth/refresh`

Rafraîchir l'access token (durée de vie : 7 jours pour le refresh token).

**Body (JSON) :**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Réponse :**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 7.4 `GET /auth/profile`

Récupérer le profil de l'utilisateur connecté.

- **Guard :** `JwtAuthGuard`

**Réponse :**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Jean Dupont",
  "role": "viewer",
  "createdAt": "2026-05-20T...",
  "lastLogin": "2026-05-20T...",
  "isActive": true
}
```

---

## 8. Endpoints Administration

**Base URL :** `/admin`  
**Guard :** `JwtAuthGuard` (admin seulement)  
**Interceptor :** `ResponseInterceptor`

### 8.1 `GET /admin/users`

Lister tous les utilisateurs. (⚠️ Actuellement stockés en mémoire — disparaissent au redémarrage.)

- **Guard :** Vérifie que l'utilisateur connecté a le rôle `admin`

**Réponse (tableau) :**
```json
[
  { "id": "uuid", "email": "...", "name": "...", "role": "viewer", "isActive": true }
]
```

### 8.2 `POST /admin/users/role`

Modifier le rôle d'un utilisateur.

**Body :**
```json
{
  "email": "user@example.com",
  "role": "analyst"
}
```

**Rôles valides :** `admin`, `analyst`, `viewer`

### 8.3 `POST /admin/users/toggle`

Activer/désactiver un compte utilisateur.

**Body :**
```json
{
  "email": "user@example.com"
}
```

### 8.4 `POST /admin/users/delete`

Supprimer un utilisateur (sauf soi-même).

**Body :**
```json
{
  "email": "user@example.com"
}
```

**Réponse :**
```json
{
  "message": "User deleted successfully"
}
```

### 8.5 `GET /admin/stats`

Statistiques d'administration du système.

**Réponse :**
```json
{
  "totalUsers": 0,
  "activeSessions": 0,
  "apiCallsToday": 0,
  "systemUptime": 1234.56
}
```

> **Note :** Les valeurs sont actuellement statiques (sauf `systemUptime`). À enrichir avec une vraie base de données.

---

## 9. Endpoints Prédiction ML

**Base URL :** `/predict`  
**Guard :** Aucun (accessible sans authentification)

### 9.1 `POST /predict`

Prédire les ventes en fonction de features métier. Le backend tente d'appeler une API ML externe (Python FastAPI sur `http://localhost:8000`). Si l'API ML est indisponible, un **fallback simulé** est utilisé.

**Body (JSON) :**
```json
{
  "magasin_vec": 1,
  "saison_vec": 2,
  "ventes_veille": 1200,
  "moyenne_ventes_7j": 1150,
  "est_weekend": 0,
  "est_jour_ferie": 0,
  "indicateur_promotion": 1,
  "prix_petrole": 65.5
}
```

**Description des features :**

| Champ                  | Type   | Requis | Description                            |
|------------------------|--------|--------|----------------------------------------|
| `magasin_vec`          | number | Oui    | Identifiant encodé du magasin          |
| `saison_vec`           | number | Oui    | Saison encodée (1-4)                   |
| `ventes_veille`        | number | Oui    | Ventes du jour précédent               |
| `moyenne_ventes_7j`    | number | Oui    | Moyenne des ventes des 7 derniers jours|
| `est_weekend`          | number | Non    | 1 si week-end, 0 sinon                 |
| `est_jour_ferie`       | number | Non    | 1 si jour férié, 0 sinon               |
| `indicateur_promotion` | number | Oui    | 1 si promotion active, 0 sinon         |
| `prix_petrole`         | number | Oui    | Prix du pétrole (facteur externe)      |

**Réponse (API ML OK) :**
```json
{
  "status": "success",
  "prediction_transactions": 1234.56,
  "source": "ml_model"
}
```

**Réponse (fallback — API ML indisponible) :**
```json
{
  "status": "success",
  "prediction_transactions": 1187.50,
  "source": "fallback"
}
```

### 9.2 `GET /predict/health`

Vérifier si l'API ML externe est accessible.

**Réponse :**
```json
{
  "mlApiStatus": "online",
  "details": "{ ... réponse de l'API ML ... }"
}
```

**Si l'API est hors ligne :**
```json
{
  "mlApiStatus": "offline",
  "fallbackEngine": "active"
}
```

---

## 10. Guide d'Intégration Frontend

### 10.1 Initialisation du Client API

Le frontend expose déjà une classe `ApiClient` dans `frontend/src/services/api.ts`. Voici les bonnes pratiques :

```typescript
// 1. Récupérer le token depuis localStorage
const token = localStorage.getItem('accessToken');

// 2. Ajouter le header Authorization
headers.set('Authorization', `Bearer ${token}`);

// 3. Gérer le rafraîchissement automatique en cas de 401
if (response.status === 401) {
  // Appeler POST /auth/refresh avec le refreshToken
  // Si succès → mettre à jour le token et réessayer la requête
  // Si échec → déconnecter l'utilisateur
}

// 4. Extraire les données (le wrapper ApiResponse est automatiquement déballé)
const json = await response.json();
const data = json.data; // Contient les données réelles
```

### 10.2 Gestion du Token Expiré

Stratégie recommandée pour le frontend :

```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        // Rediriger vers login
        return Promise.reject(error);
      }
      try {
        const { accessToken } = await apiClient.refreshToken(refreshToken);
        localStorage.setItem('accessToken', accessToken);
        error.config.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(error.config); // Réessayer la requête originale
      } catch {
        // Refresh token invalide → logout
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

### 10.3 Correspondance Types Frontend / API

| Type Frontend (`index.ts`) | Endpoint API correspondant        |
|----------------------------|-----------------------------------|
| `GlobalStats`              | `GET /stats/global`               |
| `TemporalData[]`           | `GET /stats/temporal`             |
| `CategoryStat[]`           | `GET /stats/categories`           |
| `StoreStat[]`              | `GET /stats/stores`               |

Pour les endpoints `/analytics`, utiliser `any[]` ou typer manuellement avec les champs documentés dans ce rapport.

### 10.4 Correction Importante du Frontend

**⚠️ BUG identifié :** Dans `frontend/src/services/api.ts` ligne 122, l'appel à `sales-by-day` doit être corrigé en `sales-by-dayofweek` :

```typescript
// ACTUEL (INVALIDE) :
return this.fetcher<any[]>(`/analytics/sales-by-day${this.buildQueryString(filters)}`);

// CORRECTION :
return this.fetcher<any[]>(`/analytics/sales-by-dayofweek${this.buildQueryString(filters)}`);
```

### 10.5 Bonnes Pratiques

1. **Utiliser les endpoints `/stats` pour le chargement initial du dashboard** — ils sont typés et passent par le cache.
2. **Utiliser les endpoints `/analytics` pour les vues analytiques détaillées** — ils acceptent des filtres dynamiques.
3. **Utiliser `/analytics/full-dashboard` pour un tableau de bord complet en un appel** — idéal pour la page d'accueil.
4. **Ne pas appeler `/analytics/custom-query` depuis le frontend** — réservé aux tests et à l'administration.
5. **Limiter le nombre d'appels simultanés** — Databricks a des ressources limitées. Préférer `/analytics/full-dashboard` à 6 appels séparés.
6. **Gérer les timeouts** — Certaines requêtes peuvent prendre plusieurs secondes sur le cluster Databricks.

---

## 11. Codes d'Erreur & Gestion des Cas Limites

### 11.1 Codes HTTP

| Code | Signification               | Cause fréquente                                      |
|------|-----------------------------|------------------------------------------------------|
| 200  | Success                     | Requête traitée normalement                          |
| 201  | Created                     | Ressource créée (register)                           |
| 400  | Bad Request                 | Paramètres de requête invalides                      |
| 401  | Unauthorized                | Token manquant, expiré ou invalide                   |
| 403  | Forbidden                   | Accès non autorisé (admin requis)                    |
| 404  | Not Found                   | Route inexistante                                    |
| 409  | Conflict                    | Email déjà utilisé (register)                        |
| 429  | Too Many Requests           | Rate limit dépassé (100 req/min)                     |
| 500  | Internal Server Error       | Erreur Databricks ou autre erreur serveur            |
| 503  | Service Unavailable         | Connexion Databricks impossible                      |

### 11.2 Codes d'Erreur dans le Corps

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired JWT token"
  }
}
```

Codes possibles :
| Code                        | Message                                        |
|-----------------------------|-------------------------------------------------|
| `UNAUTHORIZED`              | Invalid or expired JWT token                    |
| `FORBIDDEN`                 | Admin access required                           |
| `CONFLICT`                  | Email already registered                        |
| `DATABRICKS_CONNECTION`     | Failed to connect to Databricks                 |
| `DATABRICKS_QUERY`          | Query execution failed                          |
| `VALIDATION_ERROR`          | Validation failed (class-validator)             |
| `QUERY_TOO_LONG`            | Query too long (max 2000 chars)                 |
| `QUERY_NOT_ALLOWED`         | Only SELECT/WITH queries are allowed            |
| `INTERNAL_ERROR`            | Internal server error                           |

### 11.3 Cas Limites à Gérer côté Frontend

1. **Databricks hors ligne** : Le backend retente jusqu'à 5 fois la connexion. Si elle échoue, erreur 503.
2. **Requêtes longues** : Sur 80M+ lignes, les requêtes sans index peuvent prendre 5-30s.
3. **Résultats vides** : Les tableaux peuvent être vides (aucune donnée pour les filtres spécifiés).
4. **Token expiré pendant une requête longue** : Gérer le refresh dans un intercepteur.
5. **Backend non démarré** : Afficher un message "Service indisponible" avec option de rechargement.

---

## 12. Annexe : Exemples Concrets d'Appels

### 12.1 Avec cURL

```bash
# Health check
curl http://localhost:3000/stats/health

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@retailsense.ai","password":"admin123"}'

# Récupérer le token depuis la réponse, puis :
TOKEN="eyJhbGciOiJIUzI1NiIs..."

# Stats globales
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/stats/global

# Ventes mensuelles
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/analytics/sales-by-month?year=2015"

# Top 20 produits
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/analytics/top-products?limit=20&family=GROCERY%20I"

# Full dashboard avec filtre magasin
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/analytics/full-dashboard?store_nbr=1&startDate=2015-01-01&endDate=2015-12-31"

# Prédiction ML
curl -X POST http://localhost:3000/predict \
  -H "Content-Type: application/json" \
  -d '{"magasin_vec":1,"saison_vec":2,"ventes_veille":1200,"moyenne_ventes_7j":1150,"indicateur_promotion":1,"prix_petrole":65.5}'
```

### 12.2 Avec JavaScript (Fetch)

```javascript
// Authentification
const login = async () => {
  const res = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@retailsense.ai', password: 'admin123' }),
  });
  const json = await res.json();
  const { accessToken, refreshToken, user } = json.data;
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
};

// Appel API authentifié
const fetchStats = async (endpoint) => {
  const res = await fetch(`http://localhost:3000${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
    },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error?.message);
  return json.data;
};

// Utilisation
const globalStats = await fetchStats('/stats/global');
const topProducts = await fetchStats('/analytics/top-products?limit=10');
const dashboard = await fetchStats('/analytics/full-dashboard?startDate=2015-01-01&endDate=2016-12-31');
```

### 12.3 Avec TypeScript (React Query / TanStack Query)

```typescript
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';

// Usage dans un composant React
const { data: globalStats, isLoading, error } = useQuery({
  queryKey: ['globalStats'],
  queryFn: () => apiClient.getGlobalStats(),
});

const { data: salesByMonth } = useQuery({
  queryKey: ['salesByMonth', { year: 2015 }],
  queryFn: () => apiClient.salesByMonth({ year: 2015 }),
});

const { data: dashboard } = useQuery({
  queryKey: ['fullDashboard', { store_nbr: '1', startDate: '2015-01-01' }],
  queryFn: () => apiClient.fullDashboard({ store_nbr: '1', startDate: '2015-01-01' }),
});
```

---

## Résumé des Routes API

| Méthode | Route                                    | Auth   | Description                            |
|---------|------------------------------------------|--------|----------------------------------------|
| GET     | `/stats/health`                          | ❌    | Health check serveur                   |
| GET     | `/stats/global`                          | ✅    | Statistiques globales                  |
| GET     | `/stats/temporal`                        | ✅    | Stats temporelles (year, month)        |
| GET     | `/stats/categories`                      | ✅    | Top catégories (limit)                 |
| GET     | `/stats/stores`                          | ✅    | Top magasins (limit)                   |
| GET     | `/analytics/sales-by-dayofweek`          | ✅    | Ventes par jour de la semaine          |
| GET     | `/analytics/sales-by-month`              | ✅    | Ventes mensuelles                      |
| GET     | `/analytics/sales-by-year`               | ✅    | Ventes annuelles                       |
| GET     | `/analytics/promotion-impact`            | ✅    | Impact des promotions                  |
| GET     | `/analytics/top-products`                | ✅    | Top produits                           |
| GET     | `/analytics/top-stores`                  | ✅    | Top magasins                           |
| GET     | `/analytics/sales-trend`                 | ✅    | Tendance des ventes                    |
| GET     | `/analytics/category-performance`        | ✅    | Performance par catégorie              |
| GET     | `/analytics/store-type-comparison`       | ✅    | Comparaison types de magasins          |
| GET     | `/analytics/city-performance`            | ✅    | Performance par ville                  |
| GET     | `/analytics/holiday-effect`              | ✅    | Effet jour férié/promo                 |
| GET     | `/analytics/inventory-insights`          | ✅    | Insights stocks                        |
| GET     | `/analytics/seasonal-patterns`           | ✅    | Patterns saisonniers                   |
| GET     | `/analytics/full-dashboard`              | ✅    | Dashboard complet (6 queries)          |
| GET     | `/analytics/custom-query`                | ✅    | SQL personnalisé (⚠️ usage interne)    |
| POST    | `/auth/register`                         | ❌    | Créer un compte                        |
| POST    | `/auth/login`                            | ❌    | Connexion                              |
| POST    | `/auth/refresh`                          | ❌    | Rafraîchir token                       |
| GET     | `/auth/profile`                          | ✅    | Profil utilisateur                     |
| GET     | `/admin/users`                           | ✅    | Liste des utilisateurs (admin)         |
| POST    | `/admin/users/role`                      | ✅    | Changer rôle (admin)                   |
| POST    | `/admin/users/toggle`                    | ✅    | Activer/désactiver (admin)             |
| POST    | `/admin/users/delete`                    | ✅    | Supprimer utilisateur (admin)          |
| GET     | `/admin/stats`                           | ✅    | Stats admin                            |
| POST    | `/predict`                               | ❌    | Prédiction ML                          |
| GET     | `/predict/health`                        | ❌    | Statut API ML                          |

---

