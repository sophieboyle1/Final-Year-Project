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
          <div className="image-container">
            <img src={image} alt="A&E Services" className="side-image" />
          </div>
          <div className="text-container">
            <h1 className="main-title">Welcome to the A&E</h1>
            <h1 className="main-title-2">Waiting Times Dashboard</h1>
            <p className="subheading">Stay updated with real-time data and AI-powered predictions.</p>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
