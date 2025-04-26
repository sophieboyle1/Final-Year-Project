import React from 'react';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton } from '@ionic/react';
import './Header.css';
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <IonHeader>
      <IonToolbar className="header-toolbar">
        <IonTitle className="header-title">
          <Link to="/">
            <img src={logo} alt="Logo" className="logo" />
          </Link>
        </IonTitle>

        <IonButtons slot="end" className="nav-container">
          <IonButton className="nav-button" routerLink="/data" routerDirection="forward">A&E Data</IonButton>
          <IonButton className="nav-button" routerLink="/reports" routerDirection="forward">Reports</IonButton>
          <IonButton className="nav-button" routerLink="/predictions" routerDirection="forward">Predictions</IonButton>
          <IonButton className="nav-button" routerLink="/chatbot" routerDirection="forward">Chatbot</IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;