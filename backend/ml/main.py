from flask import Flask, request, jsonify
from pyspark.sql import SparkSession
from pyspark.ml import PipelineModel

# Initialisation Flask
app = Flask(__name__)

# Création de la session Spark
spark = SparkSession.builder \
    .appName("PredictionAPI") \
    .master("local[*]") \
    .getOrCreate()

# Chargement du modèle
model = PipelineModel.load("random_forest_model")

# Route principale
@app.route("/")
def home():
    return "API de prédiction active"

# Route de prédiction
@app.route("/predict", methods=["POST"])
def predict():

    try:
        # Récupération des données JSON
        data = request.get_json()

        # Création DataFrame Spark
        df = spark.createDataFrame([data])

        # Prédiction
        predictions = model.transform(df)

        # Récupération du résultat
        result = predictions.select("prediction").collect()[0][0]

        # Retour JSON
        return jsonify({
            "prediction": float(result)
        })

    except Exception as e:
        return jsonify({
            "error": str(e)
        })

# Lancement serveur
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
