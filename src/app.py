from flask import Flask, jsonify, send_from_directory, abort
import pandas as pd
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

@app.route('/api/reports', methods=['GET'])
def get_reports():
    # Load cleaned data
    data = pd.read_csv('/Users/sophieboyle/Documents/Final-Year-Project/data/hse_scraped_data.csv')

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
@app.route('/api/visualization/trolley_predictions.png', methods=['GET'])
def serve_prediction_image():
    image_path = '/Users/sophieboyle/Documents/Final-Year-Project/final-year-project/src/assets'
    image_name = 'trolley_predictions.png'

    # Check if the file exists before trying to serve it
    if not os.path.exists(os.path.join(image_path, image_name)):
        print(f"Image file not found: {os.path.join(image_path, image_name)}")
        return abort(404)

    return send_from_directory(image_path, image_name)
    

if __name__ == '__main__':
    app.run(debug=True, port=5000)
