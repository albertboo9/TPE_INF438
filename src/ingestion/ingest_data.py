# Data Ingestion Script
# Handles batch ingestion (CSV/JSON) and API ingestion (weather)

import requests
import pandas as pd
from pyspark.sql import SparkSession
import os

# Initialize Spark
spark = SparkSession.builder.appName("SupermarketSalesIngestion").getOrCreate()

# Paths
raw_path = "data-lake/raw/"

def ingest_kaggle_data():
    """Placeholder for Kaggle data download"""
    # TODO: Implement Kaggle API download
    # For now, assume data is placed manually in raw/
    print("Kaggle data ingestion - manual placement required")

def ingest_holidays():
    """Ingest holidays JSON"""
    # Placeholder - create or download holidays.json
    print("Holidays ingestion")

def ingest_weather(api_key, location):
    """Ingest weather data via API"""
    url = f"http://api.openweathermap.org/data/2.5/weather?q={location}&appid={api_key}"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        # Save to raw/
        with open(os.path.join(raw_path, "weather.json"), "w") as f:
            f.write(str(data))
    else:
        print("Weather API failed")

if __name__ == "__main__":
    ingest_kaggle_data()
    ingest_holidays()
    # ingest_weather("your-api-key", "Yaounde")  # Example