import React from 'react';
import { IonContent, IonPage, IonButton } from '@ionic/react';
import Header from './Header';
import './Home.css';
import image from '../assets/hospital.jpg';

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
            <h2 className="subheading">Understanding Emergency Department Trends</h2>
            <p className="project-description">
              This project applies advanced data analytics to examine emergency department attendance using real & synthetic data.
              Through machine learning models, statistical analysis, and cloud computing, key trends in hospital visits are uncovered.
              The goal is to enhance decision-making in emergency care by predicting demand, identifying seasonal variations, and analyzing external influences.
            </p>

            <div className="button-container">
              <IonButton expand="full" color="primary" routerLink="/aedata">
                Explore Data
              </IonButton>
              <IonButton expand="full" color="secondary" routerLink="/reports">
                View Reports
              </IonButton>
            </div>
          </div>
        </div>

        {/* Second Section - Features & How It Works */}
        <div className="features-section">
          <h2 className="section-title">How This Project Works</h2>
          <p className="section-description">
            This project integrates real hospital attendance records with synthetic data to analyze trends, simulate different scenarios, and enhance predictive accuracy.
            By leveraging data preprocessing, visualization, and machine learning techniques, insights into patient flow and hospital efficiency are derived.
          </p>

          <div className="features-grid">
            <div className="feature-box">
              <h3>📊 Real Data Analysis</h3>
              <p>Utilizing historical hospital records to track waiting times, peak attendance, and seasonal trends.</p>
            </div>
            <div className="feature-box">
              <h3>🤖 Machine Learning</h3>
              <p>Predicting A&E demand using **Random Forest models** and statistical forecasting.</p>
            </div>
            <div className="feature-box">
              <h3>☁️ Cloud Storage</h3>
              <p>Using cloud computing to store, process, and analyze large-scale emergency attendance data.</p>
            </div>
            <div className="feature-box">
              <h3>🧪 Synthetic Data</h3>
              <p>Generating **realistic synthetic data** to compare with actual statistics and test predictive models.</p>
            </div>
          </div>
        </div>

        {/* Third Section - Data Exploration */}
        <div className="exploration-section">
          <h2 className="section-title">Explore the Data</h2>
          <p className="section-description">
            Visualize emergency attendance trends across different months, compare real vs. synthetic datasets,
            and analyze external factors like weather conditions, holidays, and seasonal variations affecting A&E demand.
          </p>

          <div className="exploration-grid">
            <div className="exploration-box">
              <h3>📈 Interactive Graphs</h3>
              <p>Dive into hospital data with dynamic charts to track A&E trends over time.</p>
            </div>
            <div className="exploration-box">
              <h3>🛠️ Data Filters</h3>
              <p>Customize your analysis by filtering data based on time of year, hospital type, and attendance category.</p>
            </div>
            <div className="exploration-box">
              <h3>🔍 Real vs. Synthetic Comparison</h3>
              <p>Analyze the differences between actual hospital data and AI-generated synthetic data.</p>
            </div>
          </div>
          <div className="button-container">
            <IonButton expand="full" className="exploration-button" routerLink="/aedata">
              Start Exploring
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
