# Final-Year-Project

## A Data Analytics Approach to Time-Series Forecasting of A&E Attendance

This project explores how machine learning can be applied to time-series forecasting using real-world healthcare data. It focuses on predicting monthly Accident & Emergency (A&E) attendances across NHS hospital trusts in England, using historical data from 2020 to 2024.

This project includes a complete end-to-end pipeline.
It demonstrates:
- A full data preprocessing pipeline, including handling missing and corrupted values
- Synthetic data generation to fill gaps in time-series data
- Feature engineering using lag values, rolling averages, and calendar-based indicators
- A comparative evaluation of four machine learning models (Random Forest, XGBoost, Linear Regression, LSTM)
- A deployed web-based frontend and chatbot interface for interacting with forecasts

The final model was chosen based on a balance of predictive performance, robustness, and interpretability, and is integrated into an interactive user interface for real-time forecast exploration.

## 🛠️ Technologies Used

**Programming Languages & Libraries**
- Python (Pandas, NumPy, Scikit-learn, Matplotlib, Seaborn)
- Jupyter Notebooks for experimentation and model evaluation

**Machine Learning**
- Random Forest Regressor (final model)
- XGBoost, Linear Regression, LSTM (for comparison)
- GridSearchCV for hyperparameter tuning
- Feature engineering (lag values, rolling averages, calendar features)
- Synthetic data imputation (seasonal pattern replication)

**Web & Deployment**
- React + Ionic Framework (frontend UI)
- Chatbot built with natural language matching logic in TypeScript
- Vercel (deployment of web app)
- JSON (for structured prediction output and frontend integration)

**Version Control**
- Git + GitHub

## 🚀 Getting Started

Follow the steps below to run the project locally or explore the deployed version.

## Deployed Version (Live Demo)
You can also explore the deployed project on Vercel:

🔗 [Visit the live site](https://final-year-project-git-main-sophie-boyles-projects.vercel.app/)

### 1. Clone the Repository

```
git clone https://github.com/sophieboyle1/Final-Year-Project.git
cd Final-Year-Project
```

### 2. Run the Machine Learning Pipeline (Python)
Inside the `backend/src/` you'll find Jupyter notebooks that handle:

- Data cleaning and imputation

- Feature engineering

- Model training and comparison

- Exporting forecasts to models/predictions.json

### To run locally:

```
pip install -r requirements.txt
jupyter notebook
```

Open the main notebook to execute the pipeline and generate forecast outputs.

### 3. Run the Frontend (React + Ionic)
Navigate to the frontend folder and install dependencies:

```
cd final-year-project
npm install
npm run dev
```
This launches the interactive web dashboard and chatbot interface at 
http://localhost:5173


## 📂 Project Structure

```text
Final-Year-Project/
│
├── backend/                    # Machine learning & data processing pipeline                   
│   ├── data/                   # Processed datasets
│   ├── models/                 # Trained models or model scripts
│   ├── raw/                    # Raw NHS datasets
│   ├── src/                    # Notebooks, scripts, utilities
│
├── final-year-project/        # Frontend React + Ionic app
│   ├── public/data/           # Forecast output (e.g., predictions.json)
│   ├── src/assets/            # Static assets (images, etc.)
│   ├── src/components/        # Reusable UI components
│   ├── src/pages/             # Main page logic (A&E dashboard, chatbot)
│
├── requirements.txt           # Python dependencies for backend
├── README.md                  # Project overview and setup guide

```

## 🙌 Acknowledgements

This project was completed as part of the B.Sc. (Hons) in Software Development at Atlantic Technological University (ATU), Galway.

Special thanks to my supervisor, **Andrew Beatty**, for his guidance and support throughout the development of this Final Year Project.

## Screencast
This is the screencast for my project: https://www.youtube.com/watch?v=7Wa9Y-2Ca_8

