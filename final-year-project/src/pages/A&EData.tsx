import React, { useState, useEffect } from "react";
import { IonContent, IonPage } from "@ionic/react";
import Header from "./Header";
import "./AandEData.css";
import YearlyComparisonChart from "./YearlyComparisonChart"; // D3 Chart Component
import { fetchReportData } from "../services/dataService"; // Now correctly typed

const AandEData: React.FC = () => {
  const [selectedYear, setSelectedYear] = useState<string>("2024");
  const [aeData, setAeData] = useState<any[]>([]);

  useEffect(() => {
    // Fetch real A&E data
    const getData = async () => {
      try {
        const data = await fetchAandEData(); // Fetch A&E Data from API
        console.log("Fetched A&E Data:", data); // Debugging log
        setAeData(data);
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
        
        {/* 🔹 SECTION 1: Yearly Comparison */}
        <div className="data-visualization">
          <h2 className="section-title">📊 Yearly A&E Attendances</h2>
          <p className="section-description">
            Select a year to see **A&E attendances** for **Type 1, Type 2, and Type 3 departments**.
          </p>

          {/* Year Selection Dropdown */}
          <div className="filter-container">
            <label htmlFor="year-select">📅 Select Year:</label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
              <option value="2019">2019</option>
            </select>
          </div>

          {/* D3.js Yearly Comparison Chart */}
          <div className="graph-container">
            <YearlyComparisonChart data={aeData} selectedYear={selectedYear} />
          </div>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default AandEData;
