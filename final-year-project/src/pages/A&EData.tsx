import React, { useState, useEffect } from "react";
import { IonContent, IonPage } from "@ionic/react";
import Header from "./Header";
import "./AandEData.css";
import YearlyComparisonChart from "./YearlyComparisonChart"; // D3 Bar Chart
import SeasonalTrendsChart from "./SeasonalTrendsChart"; // D3 Line Chart
import { fetchAandEData } from "../services/dataService";

const AandEData: React.FC = () => {
  const [aeData, setAeData] = useState<any[]>([]); // Ensuring data is an array

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchAandEData();
        if (Array.isArray(data)) {
          setAeData(data);
        } else {
          console.error("❌ Data is not an array:", data);
        }
      } catch (error) {
        console.error("Error fetching A&E data:", error);
      }
    };
    getData();
  }, []);

  return (
    <IonPage>
      <Header />
      <IonContent className="ion-padding">

        {/* 🔹 SECTION 1: Data Overview */}
        <div className="data-page-header">
          <h1 className="page-title">📊 A&E Data Analysis</h1>
          <p className="page-description">
            This page visualizes **emergency department trends** based on **real hospital data**.
          </p>
        </div>

        {/* 🔹 SECTION 2: Yearly Comparison Bar Chart */}
        <div className="data-visualization">
          <h2 className="section-title">📈 Yearly A&E Attendance Trends</h2>
          <p className="section-description">
            This visualization breaks down **Type 1, Type 2, and Type 3** attendances across multiple years.
          </p>
          <div className="graph-container">
            <YearlyComparisonChart data={aeData} />
          </div>
        </div>

        {/* 🔹 SECTION 3: Seasonal Trends Line Chart */}
        <div className="data-visualization">
          <h2 className="section-title">📉 Seasonal Impact on A&E Attendances</h2>
          <p className="section-description">
            How do different seasons affect A&E visits? This chart shows **seasonal fluctuations** in patient numbers.
          </p>
          <div className="graph-container">
            <SeasonalTrendsChart data={aeData} />
          </div>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default AandEData;
