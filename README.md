# Predictive Sales Analysis in a Supermarket - TPE_INF438

## Project Overview

This project develops an end-to-end Big Data prediction system for supermarket sales forecasting. It demonstrates Big Data principles (Volume, Velocity, Variety) through a layered architecture, utilizing Apache Spark for processing, a Feature Store for reusability, and Firebase for serving predictions.

Problem Classification: Time Series Forecasting
Key Focus: Advanced feature engineering, temporal splitting, industrial architecture

## Architecture

```
[SOURCES] -> [INGESTION] -> [DATA LAKE - RAW] -> [PROCESSING - SPARK ETL] -> [FEATURE STORE] -> [ML PIPELINE] -> [PREDICTIONS] -> [SERVING - FIREBASE] -> [VISUALISATION]
```

### Layers Details
- Ingestion: Batch (CSV/JSON) + API (weather)
- Data Lake: /data-lake/raw/, /data-lake/cleaned/, /data-lake/features/
- Processing: Spark ETL (Cleaning -> Transformation -> Feature Engineering)
- Feature Store: Parquet files for ML-ready data
- ML: Spark MLlib with temporal split, advanced FE (lags, rolling means)
- Serving: Firebase Firestore with structured NoSQL

## Objectives
- Predict future sales using historical data (customers, seasons, promotions)
- Implement proper time series forecasting with industrial vision
- Maximize academic impact through architecture justification and documentation

## Data Sources
- Primary: Kaggle Supermarket Sales Dataset (https://www.kaggle.com/datasets/alexhuitron/supermarket-sales)
- Additional:
  - Holidays JSON
  - Weather API (OpenWeatherMap)

## Technologies
- Apache Spark 3.5.0: Data processing & ML
- Python 3.13: Core language
- Firebase: Serving layer
- Jupyter Notebook: EDA & experimentation

## Project Structure
```
.
├── data-lake/
│   ├── raw/           # Raw data (CSV, JSON)
│   ├── cleaned/       # Cleaned data
│   └── features/      # ML-ready features (Parquet)
├── src/
│   ├── ingestion/     # Data ingestion scripts
│   ├── processing/    # ETL pipeline
│   ├── ml/           # ML models & pipelines
│   └── serving/      # Firebase export
├── notebooks/        # Jupyter notebooks for analysis
├── config/           # Configuration files
├── scripts/          # Utility scripts
├── tests/           # Unit tests
├── docs/            # Documentation
├── requirements.txt  # Python dependencies
└── README.md        # This file
```

## Quick Start

### Prerequisites
- Python 3.13+
- Apache Spark 3.5.0
- Java 8+
- Firebase account

### Installation
```bash
pip install -r requirements.txt
```

### Setup
1. Download Kaggle dataset and place in data-lake/raw/
2. Configure Firebase in config/firebase_config.py
3. Run ingestion: python src/ingestion/ingest_data.py

## Methodology

### Phase 0: Design
- Architecture definition
- Data modeling

### Phase 1: Ingestion
- Batch & API data collection

### Phase 2: Data Engineering
- EDA, cleaning, advanced feature engineering

### Phase 3: Feature Store
- Create reusable ML datasets

### Phase 4: Machine Learning
- Temporal split (train=past, test=future)
- Models: Linear Regression, Random Forest, Gradient Boosting
- Evaluation: RMSE, MAE, MAPE, R²

### Phase 5: Prediction
- Generate future forecasts

### Phase 6: Serving
- Export to Firebase

### Phase 7: Documentation
- Report & presentation

## Evaluation Metrics
- Model: RMSE, MAE, MAPE, R²
- Business: Sales prediction accuracy
- System: Processing time, scalability

## Key Differentiators
- Advanced Feature Engineering: Lags, rolling statistics, seasonality
- Temporal Correctness: Proper time series split
- Industrial Architecture: Feature Store, decoupled serving
- Comprehensive Documentation: Justified choices, limitations, perspectives

## Documentation
- [Detailed Plan](.kilo/plans/1777711784236-crisp-star.md)
- [Big Data Visualization Plan](.kilo/plans/1778551692599-curious-rocket.md)
- Notebooks in /notebooks/
- Final report in /docs/

## Plateforme de Visualisation Big Data RetailSense AI

Cette plateforme fournit un dashboard analytique moderne pour l'analyse prédictive des ventes de la chaîne Corporación Favorita (125M lignes de données).

### Architecture
```
Databricks Delta Lake (train_clean) → NestJS API Gateway (port 3000) → React Dashboard (port 5173)
```

### Pages du Dashboard
- **Dashboard** (executive_overview) : Vue d'ensemble avec métriques clés (Revenue, Units, Conversion, Growth)
- **Predictions** (predictive_insights) : Prévisions et recommandations produits avec module Smart Promotions
- **Intelligence** (product_intelligence) : Analyse détaillée des SKU avec tableau interactif

### Démarrage rapide - Backend
```bash
cd backend
cp .env.example .env
# Configurer DATABRICKS_HOST, DATABRICKS_PATH, DATABRICKS_TOKEN
npm install
npm run start:dev
```

### Démarrage rapide - Frontend
```bash
cd frontend
npm install
npm run dev
```

### Endpoints API
| Endpoint | Description | Paramètres |
|----------|-------------|------------|
| GET /stats/global | CA total, volume, impact promo | - |
| GET /stats/temporal | Ventes par jour/semaine | `?year=2024&month=12` |
| GET /stats/categories | Top 10 catégories | `?limit=10` |
| GET /stats/stores | Performance magasins | `?limit=10` |

## Contributing
This is an academic project. Follow the established architecture and document all changes.

## License
Academic project - no license.

---

Master TPE_INF438 - Predictive Sales Analysis in a Supermarket