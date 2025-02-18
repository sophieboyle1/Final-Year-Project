import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import Header from './Header';
import './Home.css';
import image from '../assets/hospital.jpg';

const HomePage: React.FC = () => {
  return (
    <IonPage>
      <Header />
      <IonContent className="ion-padding">
        <div className="homepage-container">
          
          {/* Left Side - Image */}
          <div className="image-container">
            <img src={image} alt="Hospital Building" className="side-image" />
          </div>

          {/* Right Side - Project Overview */}
          <div className="text-container">
            <h1 className="main-title">A&E Data Analysis</h1>
            <h2 className="subheading">Understanding Emergency Department Trends</h2>

            <p className="description">
              Analyzing hospital admissions and waiting times using real & synthetic data, 
              with machine learning and statistical modeling to uncover trends and improve efficiency.
            </p>

            <div className="button-container">
              <button className="primary-button">Explore Data</button>
              <button className="secondary-button">View Reports</button>
            </div>
          </div>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
