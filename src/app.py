import pandas as pd
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/api/reports', methods=['GET'])
def get_reports():
    # Load cleaned data
    try:
        data = pd.read_csv('/Users/sophieboyle/Documents/Final-Year-Project/data/hse_scraped_data.csv')
    except FileNotFoundError:
        return jsonify({"error": "Data file not found"}), 404

    # Select only the relevant columns and drop unnecessary ones
    columns_to_keep = [
        "Daily Trolley count",
        "Daily Trolley count.1",
        "Daily Trolley count.2",
        "Delayed Transfers of Care (As of Midnight)",
        "No of >75+yrs Waiting >24hrs",
        "No of Total Waiting >24hrs",
        "Surge Capacity in Use (Full report @14:00)"
    ]
    data = data[columns_to_keep]

    # Handle missing values by replacing NaNs with None
    data = data.where(pd.notnull(data), None)

    # Convert it to JSON format
    result = data.to_dict(orient='records')

    return jsonify(result)

# Serving the prediction image
@app.route('/api/visualization/trolley_predictions.png')
def serve_prediction_image():
    return send_from_directory('/Users/sophieboyle/Documents/Final-Year-Project/src/static', 'trolley_predictions.png')

if __name__ == '__main__':
    app.run(debug=True, port=5000)
