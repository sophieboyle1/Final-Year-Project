import React from "react";
import { IonContent, IonPage } from "@ionic/react";
import Header from "./Header";
import RidgelineChart from "./RidgelineChart";
import "./Reports.css";

const Reports: React.FC = () => {
  return (
    <IonPage>
      <Header />
      <IonContent className="ion-padding">
        <section className="reports-intro">
          <h2>Technical Reports & Data Preprocessing</h2>
          <p>
            This section provides a detailed breakdown of the technical work that powered the A&E data analysis
            and prediction models. While the A&E Data Page highlights key findings, this page focuses on
            the behind-the-scenes processes: how raw NHS data was cleaned, enhanced, and transformed into a
            structured format suitable for machine learning.
          </p>
          <p>
            You’ll find explanations on how missing months were handled, how synthetic values were generated,
            what feature engineering techniques were applied, and why these steps were crucial for
            producing accurate and reliable predictions.
          </p>
        </section>
      </IonContent>
    </IonPage>
  );
};

export default Reports;
