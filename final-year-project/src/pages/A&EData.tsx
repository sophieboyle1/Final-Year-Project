import React from 'react';
import { IonPage, IonContent, IonHeader, IonTitle } from '@ionic/react';
import Header from './Header';

const AandEData: React.FC = () => {
  return (
    <IonPage>
      <Header />
      <IonContent className="ion-padding">
        <h1>A&E Data Analysis</h1>
        <p>Welcome to the A&E Data Analysis page. Here you can explore detailed data regarding hospital admissions and emergency statistics.</p>
      </IonContent>
    </IonPage>
  );
};

export default AandEData;
