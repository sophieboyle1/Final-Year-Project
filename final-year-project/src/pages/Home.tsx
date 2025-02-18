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
              Analyzing hospital admissions and waiting times using real & synthetic data,
              with machine learning and statistical modeling to uncover trends and improve efficiency.
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
          This project applies advanced data analytics techniques to explore trends in hospital emergency visits using both real and synthetic data. By leveraging machine learning models, statistical analysis, and cloud computing, this project examines key factors influencing A&E admissions, such as seasonal patterns, holidays, and external variables. Data preprocessing, visualization, and predictive modeling are used to extract insights, detect anomalies, and optimize forecasting methods to support decision-making in emergency care management.
          </p>

          <div className="features-grid">
            <div className="feature-box">
              <h3>📊 Real Data Analysis</h3>
              <p>Using NHS data to track waiting times, seasonal trends, and peak attendance.</p>
            </div>
            <div className="feature-box">
              <h3>🤖 Machine Learning</h3>
              <p>Predicting A&E demand using Random Forest and other ML models.</p>
            </div>
            <div className="feature-box">
              <h3>☁️ Cloud Storage</h3>
              <p>Hosting and processing data using cloud computing for scalability.</p>
            </div>
            <div className="feature-box">
              <h3>🧪 Synthetic Data</h3>
              <p>Generating realistic synthetic data to compare with real-world statistics.</p>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
