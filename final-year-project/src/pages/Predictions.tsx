import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import Header from './Header'; 

const Predictions: React.FC = () => {
  return (
    <IonPage>
      <Header />
      <IonContent className="ion-padding">
        <h1>Predictions</h1>
        <p>Prediction data will be displayed here once it's available.</p>
      </IonContent>
    </IonPage>
  );
};

export default Predictions;