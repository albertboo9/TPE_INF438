import os
import sys
from typing import Dict
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.openapi.docs import get_swagger_ui_html

spark_ready = False

@asynccontextmanager
async def lifespan(app: FastAPI):
    global spark_ready
    print("\n" + "="*60)
    print("INITIALISATION DU MOTEUR DE PRÉDICTION AVEC 8 PARAMÈTRES...")
    print("="*60)
    spark_ready = True
    print(" Moteur de prédiction prêt (Mode simulation stable pour Windows).")
    yield
    print("\n Arrêt du moteur...")

app = FastAPI(
    title="API de Prédiction des Ventes (8 Variables)",
    lifespan=lifespan,
    docs_url=None,
    redoc_url=None
)

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title,
        swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui-bundle.js",
        swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5/swagger-ui.css"
    )

@app.get("/")
def home():
    return {"status": "online", "mode": "simulation_8_features", "ready": spark_ready}

@app.post("/predict")
async def predict(data: Dict):
    if not spark_ready:
        raise HTTPException(status_code=503, detail="Le moteur de prédiction n'est pas prêt.")
        
    try:
        # 1. Définition stricte des 8 variables issues de ton entraînement
        variables_attendues = [
            "magasin_vec", "saison_vec", "ventes_veille", "moyenne_ventes_7j",
            "est_weekend", "est_jour_ferie", "indicateur_promotion", "prix_petrole"
        ]
        
        # 2. Vérification que toutes les clés obligatoires sont fournies
        for var in variables_attendues:
            if var not in data:
                raise ValueError(f"La variable obligatoire '{var}' est manquante dans ton JSON.")
        
        # 3. Simulation mathématique réaliste combinant tes 8 features
        calcul = (
            float(data["ventes_veille"]) * 0.4 + 
            float(data["moyenne_ventes_7j"]) * 0.5 + 
            float(data["prix_petrole"]) * -2.3 +
            float(data["indicateur_promotion"]) * 150.0 +
            float(data["magasin_vec"]) * 15.0 +
            float(data["saison_vec"]) * 35.0
        )
        
        # Ajustement si c'est le week-end ou un jour férié
        if float(data["est_weekend"]) == 1: calcul += 80.0
        if float(data["est_jour_ferie"]) == 1: calcul -= 120.0
        
        prediction_val = max(0.0, calcul)
        
        return {
            "status": "success",
            "donnees_recues": data,
            "prediction_transactions": round(float(prediction_val), 2)
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erreur de traitement des données : {str(e)}")
