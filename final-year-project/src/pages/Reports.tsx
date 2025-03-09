import React from "react";
import { IonContent, IonPage } from "@ionic/react";
import Header from "./Header";
import RidgelineChart from "./RidgelineChart"; // Import the D3 chart
import "./Reports.css";

const Reports: React.FC = () => {
  return (
    <IonPage>
      <Header />
      <IonContent className="ion-padding">
        {/* SECTION 1: Key Insights */}
        <div className="insights-container">
          <h2 className="section-title">🔍 Key Findings & Insights</h2>
          <p className="section-description">
            A&E attendance patterns reveal critical trends based on seasonal changes, holidays, and external factors.
            Below are the key insights from real and synthetic data analysis:
          </p>
          <ul className="insights-list">
            <li>📈 **Hospital attendances peak during winter months, especially in December.**</li>
            <li>📉 **Non-holiday months show slightly lower demand compared to holiday periods.**</li>
            <li>🧪 **Synthetic data trends closely match real data, validating our modeling approach.**</li>
            <li>⏳ **Waiting times increase significantly during flu season and public holidays.**</li>
            <li>🔍 **Machine learning predictions indicate rising A&E demand over the next quarter.**</li>
          </ul>
        </div>

        {/* SECTION 2: Data Visualizations */}
        <div className="reports-section">
          <h2 className="section-title">📊 Interactive Data Visualizations</h2>
          <p className="section-description">
            Explore the trends in A&E attendances, compare real vs. synthetic datasets, 
            and analyze seasonal variations.
          </p>

          {/* Graph 1 - Real vs. Synthetic Data */}
          <div className="chart-container">
            <h3>🧪 Real vs. Synthetic Data Comparison</h3>
          </div>

          {/* Graph 2 - Seasonal Trends */}
          <div className="chart-container">
            <h3>📆 Seasonal Trends & Holiday Impact</h3>
            <RidgelineChart /> {/* Embed the D3 Chart */}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Reports;
