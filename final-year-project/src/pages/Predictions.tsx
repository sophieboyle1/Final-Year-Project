import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import Header from './Header';
import './Predictions.css';

// Import the images from the assets folder
import trolleyHeatmap from '../assets/trolley_heatmap.png';
import trolleyPairplot from '../assets/trolley_pairplot.png';
import trolleyPredictions from '../assets/trolley_predictions.png';
import trolleyResiduals from '../assets/trolley_residuals.png';

const Predictions: React.FC = () => {
  return (
    <IonPage>
      <Header />
      <IonContent className="ion-padding">
        <h1>Trolley Predictions Analysis</h1>
        <div className="images-container">
          <img src={trolleyHeatmap} alt="Heatmap" className="prediction-image" />
          <img src={trolleyPairplot} alt="Pairplot" className="prediction-image" />
          <img src={trolleyPredictions} alt="Predictions" className="prediction-image" />
          <img src={trolleyResiduals} alt="Residuals" className="prediction-image" />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Predictions;
