from flask import Flask, jsonify
import pandas as pd
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    return "Welcome to the A&E Waiting Times API"

@app.route('/api/reports', methods=['GET'])
def get_reports():
    # Load cleaned data
    data_file_path = os.path.join(os.path.dirname(__file__), '../data/hse_scraped_data.csv')
    data = pd.read_csv(data_file_path)

    # Convert it to JSON format
    result = data.to_dict(orient='records')

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True, port=5000)

