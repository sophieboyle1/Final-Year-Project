import React, { useEffect, useState } from 'react';
import { IonPage, IonContent } from '@ionic/react';
import Header from './Header';

const Predictions: React.FC = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    setImageUrl('http://localhost:5000/api/visualization/trolley_predictions.png');
  }, []);

  return (
    <IonPage>
      <Header />
      <IonContent className="ion-padding">
        <h1>Trolley Predictions Analysis</h1>
        {imageUrl ? (
          <img src={imageUrl} alt="Trolley Predictions Visualization" style={{ width: '100%', height: 'auto' }} />
        ) : (
          <p>Loading visualization...</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Predictions;
