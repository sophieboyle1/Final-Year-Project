import React from 'react';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton } from '@ionic/react';
import './Header.css';
import logo from '../assets/logo.png';

const Header: React.FC = () => {
  return (
    <IonHeader>
      <IonToolbar className="header-toolbar">
        <IonTitle className="header-title">
        <img src={logo} alt="Logo" className="logo" />
        </IonTitle>
        
        <IonButtons slot="end" className="nav-container">
    <IonButton className="nav-button" href="/data">A&E Data</IonButton>
    <IonButton className="nav-button" href="/reports">Reports</IonButton>
    <IonButton className="nav-button" href="/predictions">Predictions</IonButton>
</IonButtons>

      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
