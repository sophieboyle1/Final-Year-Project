import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import Header from './Header';
import './Home.css';

const HomePage: React.FC = () => {
  return (
    <IonPage>
      <Header />

      <IonContent className="ion-padding">
        <h1>Welcome to the A&E Waiting Times Dashboard</h1>
        <p>Stay updated with real-time data and AI-powered predictions.</p>
      </IonContent>
    </IonPage>
  );
};

export default HomePage;
