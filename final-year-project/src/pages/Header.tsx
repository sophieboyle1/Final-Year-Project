import React from 'react';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton } from '@ionic/react';
import './Header.css';

const Header: React.FC = () => {
  return (
    <IonHeader>
      <IonToolbar className="header-toolbar">
        <IonTitle className="header-title">
          <img src="/assets/logo.png" alt="Logo" className="logo" /> {/* Replace with your logo */}
        </IonTitle>
        <IonButtons slot="end">
          <IonButton className="nav-button" href="/home">Home</IonButton>
          <IonButton className="nav-button" href="/data">A&E Data</IonButton>
          <IonButton className="nav-button" href="/reports">Reports</IonButton>
          <IonButton className="nav-button" href="/predictions">Predictions</IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
