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
          <IonButton className="nav-button" href="/data">A&E Data</IonButton>
          <IonButton className="nav-button" href="/reports">Reports</IonButton>
          <IonButton className="nav-button" href="/predictions">Predictions</IonButton>
          <IonButton className="nav-button" href="/chatbot">Chatbot</IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  );
};

export default Header;
