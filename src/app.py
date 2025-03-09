from flask import Flask, jsonify
from flask_cors import CORS  # ✅ Allow frontend to access API

app = Flask(__name__)
CORS(app)  # ✅ Enable CORS for all routes

# 📌 Mock A&E Data - Replace with database query
AAND_E_DATA = [
    {"year": 2024, "total": 100000, "type1": 60000, "type2": 25000, "type3": 15000},
    {"year": 2023, "total": 95000, "type1": 58000, "type2": 24000, "type3": 13000},
    {"year": 2022, "total": 90000, "type1": 55000, "type2": 23000, "type3": 12000},
    {"year": 2021, "total": 87000, "type1": 53000, "type2": 22000, "type3": 12000},
]

@app.route("/api/reports", methods=["GET"])
def get_reports():
    """Returns a list of reports"""
    try:
        reports = [
            {"id": 1, "date": "2025-03-01", "summary": "March A&E report"},
            {"id": 2, "date": "2025-02-01", "summary": "February A&E report"}
        ]
        return jsonify(reports)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/ae_data", methods=["GET"])
def get_ae_data():
    """Returns A&E attendance data"""
    try:
        return jsonify(AAND_E_DATA)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
