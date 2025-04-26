import React from 'react';
import { IonContent, IonPage, IonButton } from '@ionic/react';
import Header from './Header';
import './Home.css';
import image from '../assets/hospital.jpg';
import dataIngestionImage from '../assets/data_ingestion.jpg';
import FeatureEngineeringImage from '../assets/feature_engineering.jpg';
import predictivemodelingImage from '../assets/predictive_modeling.png';
import { Link } from "react-router-dom"; 


const HomePage: React.FC = () => {
  return (
    <IonPage>
      <Header />
      <IonContent className="ion-padding">
        {/* First Section - Project Overview */}
        <div className="homepage-container">
          <div className="image-container">
            <img src={image} alt="A&E Services" className="side-image" />
          </div>
          <div className="text-container">
            <h1 className="main-title">A&E Data Analysis</h1>
            <h2 className="subheading">Forecasting A&E Attendance with Machine Learning</h2>
            <p className="project-description">
              This project builds a machine learning forecasting system for predicting monthly A&E attendance across NHS trusts.
              Using cleaned and feature-engineered NHS data, the system compares multiple models and deploys an interactive chatbot and dashboard
              to explore real-time predictions, trends, and model insights.
            </p>

            <div className="button-container">
              <IonButton expand="full" className="primary-button" routerLink="/predictions">
                View Predictions
              </IonButton>

              <IonButton expand="full" className="secondary-button" routerLink="/reports">
                View Reports
              </IonButton>
            </div>
          </div>
        </div>

        {/* Second Section - Project Methodology */}
        <div className="features-section">
          <h2 className="section-title">Project Methodology</h2>
          <p className="section-description">
            This project integrates real hospital attendance records with synthetic data to analyze trends, simulate different scenarios, and enhance predictive accuracy.
            By leveraging data preprocessing, visualization, and machine learning techniques, insights into patient flow and hospital efficiency are derived.
          </p>

          <div className="features-grid">
            <div className="feature-box">
              <h3>📊 Data Collection</h3>
              <p>Integrating NHS datasets and synthetic data generation for analysis.</p>
            </div>
            <div className="feature-box">
              <h3>🔎 Statistical Analysis</h3>
              <p>Identifying trends in patient arrivals, waiting times, and external factors.</p>
            </div>
            <div className="feature-box">
              <h3>🤖 Machine Learning</h3>
              <p>Predicting A&E demand using Random Forest models and statistical forecasting.</p>
            </div>
            <div className="feature-box">
              <h3>☁️ Cloud Storage</h3>
              <p>Used to temporarily store raw NHS datasets during early data exploration and cleaning stages.</p>
            </div>
          </div>
        </div>

        {/* Third Section - Data Pipeline & Processing */}
        <div className="pipeline-section">
          <h2 className="section-title">Data Pipeline & Processing</h2>
          <p className="section-description">
            The A&E data undergoes a structured pipeline for preprocessing, feature extraction,
            and predictive modeling. Key steps include:
          </p>

          <div className="pipeline-grid">
            {/* Data Ingestion */}
            <div className="pipeline-box">
              <div className="pipeline-icon">
                <img src={dataIngestionImage} alt="Data Ingestion" />
              </div>
              <h3>Data Ingestion</h3>
              <p>Loading raw hospital data, handling missing values, and normalizing formats.</p>
            </div>

            {/* Feature Engineering */}
            <div className="pipeline-box">
              <div className="pipeline-icon">
                <img src={FeatureEngineeringImage} alt="Feature Engineering" />
              </div>
              <h3>Feature Engineering</h3>
              <p>Engineering features like lag values, rolling averages, and calendar-based indicators to capture temporal trends.</p>
            </div>

            {/* Predictive Modeling */}
            <div className="pipeline-box">
              <div className="pipeline-icon">
                <img src={predictivemodelingImage} alt="Predictive Modeling" />
              </div>
              <h3>Predictive Modeling</h3>
              <p>Applying <strong>Random Forest</strong> and statistical models to forecast A&E demand.</p>
            </div>
          </div>
        </div>

        {/* Fourth Section - Key Findings */}
        <div className="findings-section">
          <h2 className="section-title">Key Findings</h2>
          <p className="section-description">
            This analysis reveals important insights into hospital attendances and factors influencing A&E demand.
          </p>

          <div className="findings-grid">
            <div className="finding-box">
              <h3>📆 Seasonal Patterns</h3>
              <p>Attendance consistently peaks during winter, with clear month-to-month variability.</p>
            </div>

            <div className="finding-box">
              <h3>📅 Monthly Patterns</h3>
              <p>Some months show repeat spikes year-to-year, highlighting predictable attendance trends.</p>
            </div>
            <div className="finding-box">
              <h3>🔁 Handling Missing Data</h3>
              <p>Synthetic values were generated using seasonal pattern replication to fill gaps in monthly data.</p>
            </div>

          </div>

          <div className="button-container">
            <IonButton expand="full" className="primary-button" routerLink="/data">
              View A&E Data
            </IonButton>
          </div>
        </div>
        {/* Footer */}
        <footer style={{ marginTop: "2rem", padding: "1rem", textAlign: "center", color: "#888" }}>
          © 2025 NHS A&E Data Insights – Final Year Project by Sophie Boyle
        </footer>
        {/* Floating Chatbot Button */}
        <Link to="/chatbot" className="floating-chatbot-button">
          🤖 Chatbot
        </Link>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
