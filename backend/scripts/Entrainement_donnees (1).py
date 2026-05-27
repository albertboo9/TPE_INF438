# Databricks notebook source
# 1. Création propre du widget
dbutils.widgets.text(
    name="horizon_jours", 
    defaultValue="4", 
    label="Horizon de prévision (Tapez le nombre de jours)"
)

# 2. Récupération brute de ce que Databricks envoie
valeur_brute = dbutils.widgets.get("horizon_jours")

# 3. Sécurisation anti-bug (si Databricks renvoie None ou du vide)
try:
    if valeur_brute is None or str(valeur_brute).strip() == "":
        HORIZON_SOUHAITE = 4
    else:
        HORIZON_SOUHAITE = int(valeur_brute)
        
    # Sécurité anti-négatif ou zéro
    if HORIZON_SOUHAITE <= 0:
        HORIZON_SOUHAITE = 4
        
except Exception as e:
    # Si l'utilisateur tape des lettres ou un espace
    HORIZON_SOUHAITE = 4

print(f"[INFO] Configuration du pipeline pour un horizon cible à J+{HORIZON_SOUHAITE}")
# 1. Importation des bibliothèques nécessaires
# 1. Importation des bibliothèques nécessaires
from pyspark.ml import Pipeline
from pyspark.ml.feature import StringIndexer, OneHotEncoder, VectorAssembler
from pyspark.ml.regression import RandomForestRegressor
from pyspark.ml.evaluation import RegressionEvaluator
from pyspark.sql import Window
import pyspark.sql.functions as F



# ==============================================================================
# 2. Chargement du dataset enrichi et Ingénierie des caractéristiques décalées
# ==============================================================================
CHEMIN_ML = "/Volumes/workspace/default/tp_inf438_volume/features/dataset_ml"
df_ml = spark.read.format("delta").load(CHEMIN_ML)

# Définition de la fenêtre : par magasin et par produit, classé par date
window_spec = Window.partitionBy("numero_magasin", "numero_produit").orderBy("date")

# --- ADAPTATION STRATÉGIE DIRECTE ---
# Au lieu d'un lag(1), on recule le point de départ de la valeur de l'horizon
df_ml = df_ml.withColumn(
    "ventes_veille_produit", 
    F.lag("ventes_unitaires", HORIZON_SOUHAITE).over(window_spec)
)

# La moyenne des 7 jours doit elle aussi glisser pour s'arrêter juste avant l'horizon
# Exemple pour J+4 : moyenne entre J-10 et J-4
df_ml = df_ml.withColumn(
     "moyenne_7j_produit", 
    F.avg("ventes_unitaires").over(window_spec.rowsBetween(-(HORIZON_SOUHAITE + 6), -HORIZON_SOUHAITE))
)

# 3. Préparation et Nettoyage des données
# Suppression de la colonne "features" si elle existe d'une exécution précédente
if "features" in df_ml.columns:
    df_ml = df_ml.drop("features")
    # --- ASTUCE : Indexation du produit hors-pipeline et suppression des métadonnées ---
prod_indexer = StringIndexer(inputCol="numero_produit", outputCol="produit_index", handleInvalid="keep")
df_ml = prod_indexer.fit(df_ml).transform(df_ml)

# On force le type en "double" : cela efface les métadonnées de catégorie.
# Le Random Forest acceptera la variable sans râler sur le paramètre maxBins !
df_ml = df_ml.withColumn("produit_index", F.col("produit_index").cast("double"))

# Suppression stricte des lignes où la variable cible est nulle
df_ml_clean = df_ml.dropna(subset=["ventes_unitaires", "ventes_veille_produit", "moyenne_7j_produit"])
df_ml_clean = df_ml_clean.sample(withReplacement=False, fraction=0.01, seed=42)

# Division des données : 80% pour l'entraînement, 20% pour le test
train_data, test_data = df_ml_clean.randomSplit([0.8, 0.2], seed=42)

print(f"Volume d'entraînement : {train_data.count()} lignes")
print(f"Volume de test        : {test_data.count()} lignes")

# 4. Construction du Pipeline de Machine Learning
# A. Conversion des catégories (Strings/Integers) en indices
indexer = StringIndexer(
    inputCols=["numero_magasin", "saison",  "famille"], 
    outputCols=["magasin_index", "saison_index", "famille_index"], 
    handleInvalid="keep"
)

# B. Encodage One-Hot (création de vecteurs binaires pour chaque catégorie)
encoder = OneHotEncoder(
    inputCols=["magasin_index", "saison_index","famille_index"], 
    outputCols=["magasin_vec", "saison_vec", "famille_vec"]
)
# C. Assemblage de toutes les variables explicatives dans un seul vecteur "features"
colonnes_features = [
    "magasin_vec", 
    "saison_vec", 
    "est_perissable", 
    "famille_vec",
    "produit_index", 
    "ventes_veille_produit", 
    "moyenne_7j_produit",
    "est_weekend", 
    "est_jour_ferie", 
    "indicateur_promotion", 
    "prix_petrole"
]
assembler = VectorAssembler(
    inputCols=colonnes_features, 
    outputCol="features", 
    handleInvalid="skip"
)
# D. Définition de l'algorithme (Random Forest Regressor)
rf = RandomForestRegressor(
    featuresCol="features", 
    labelCol="ventes_unitaires", 
    numTrees=40,      
    maxDepth=10,      
    seed=42
)
# E. Création du Pipeline global
pipeline = Pipeline(stages=[indexer, encoder, assembler, rf])
df_ml.select("famille").distinct().show()

# 5. Entraînement, Sauvegarde Spécifique et Évaluation
# ==============================================================================
print(f"\n[INFO] Début de l'entraînement du modèle J+{HORIZON_SOUHAITE}...")

modele_final = pipeline.fit(train_data)

# CRUCIAL : On change le nom du dossier de sauvegarde pour inclure l'horizon.
# Sinon, votre modèle J+4 écraserait votre modèle J+1.
chemin_sauvegarde = f"/Volumes/workspace/default/tp_inf438_volume/model/random_forest_model_j{HORIZON_SOUHAITE}"
modele_final.write().overwrite().save(chemin_sauvegarde)

# modele_final.write().overwrite().save(chemin_sauvegarde)
print(f"[INFO] Entraînement terminé ! Modèle sauvegardé sous : {chemin_sauvegarde}")
#print(f"[INFO] Entraînement terminé ! Modèle sauvegardé sous : {chemin_sauvegarde}")

# Prédictions et Évaluation
print("\n[INFO] Génération des prédictions sur les données de test...")
predictions = modele_final.transform(test_data)

evaluator_rmse = RegressionEvaluator(labelCol="ventes_unitaires", predictionCol="prediction", metricName="rmse")
rmse = evaluator_rmse.evaluate(predictions)

evaluator_r2 = RegressionEvaluator(labelCol="ventes_unitaires", predictionCol="prediction", metricName="r2")
r2 = evaluator_r2.evaluate(predictions)

print(f"\n==================================================")
print(f"PERFORMANCE DU MODÈLE POUR J+{HORIZON_SOUHAITE}")
print(f"==================================================")
print(f"Coefficient R² : {r2:.4f}")
print(f"Erreur Quadratique Moyenne (RMSE) : {rmse:.2f}")
print(f"==================================================")

display(predictions.select("date", "numero_produit", "numero_magasin", "ventes_unitaires", "prediction").limit(10))

# 6. Agrégation des Prévisions (Hiérarchie Produit -> Catégorie)
# ==============================================================================

# 1. Vue détaillée : Prévisions au niveau Produit
print("\n[INFO] Aperçu des prédictions à la maille PRODUIT :")
predictions_produit = predictions.select("date", "numero_magasin", "famille", "numero_produit", "ventes_unitaires", "prediction")
display(predictions_produit.limit(5))

# 2. Vue agrégée : Prévisions au niveau Catégorie (Approche Bottom-Up)
print("\n[INFO] Aperçu des prédictions consolidées à la maille CATÉGORIE (Famille) :")
predictions_categorie = predictions_produit.groupBy("date", "numero_magasin", "famille").agg(
     F.sum("ventes_unitaires").alias("ventes_reelles_categorie"),
    F.sum("prediction").alias("prediction_categorie")
)

# Évaluation optionnelle des performances au niveau Catégorie
evaluator_cat = RegressionEvaluator(
    labelCol="ventes_reelles_categorie", 
    predictionCol="prediction_categorie", 
    metricName="rmse"
)
rmse_categorie = evaluator_cat.evaluate(predictions_categorie)

print(f"RMSE global au niveau Catégorie : {rmse_categorie:.2f}")
display(predictions_categorie.orderBy("date", "numero_magasin", "famille").limit(10))