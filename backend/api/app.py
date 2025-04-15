from flask import Flask, jsonify
from flask_cors import CORS  # ✅ Import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)  # ✅ Enable CORS for all routes

# ✅ Load the cleaned NHS dataset
DATASET_PATH = "nhs_ae_merged.csv"

try:
    nhs_data = pd.read_csv(DATASET_PATH)
    print("✅ NHS Data Loaded Successfully!")
except Exception as e:
    print(f"❌ Failed to load NHS dataset: {e}")
    nhs_data = None

@app.route("/api/ae_data", methods=["GET"])
def get_ae_data():
    """API Endpoint to fetch NHS A&E attendance data"""
    try:
        if nhs_data is None:
            raise Exception("Dataset not available")

        # ✅ Convert DataFrame to JSON
        ae_json = nhs_data.to_dict(orient="records")
        return jsonify(ae_json)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
