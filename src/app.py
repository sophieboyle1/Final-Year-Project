from flask import Flask, jsonify
import pandas as pd

app = Flask(__name__)

@app.route('/api/reports', methods=['GET'])
def get_reports():
    # Load cleaned data
    data = pd.read_csv('../data/hse_scraped_data.csv')
    
    # Convert it to JSON format
    result = data.to_dict(orient='records')

    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
