import React, { useState } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import Header from './Header';
import './AandEData.css';

const AandEData: React.FC = () => {
  // Example state for filtering data
  const [selectedMonth, setSelectedMonth] = useState<string>('All');

  return (
    <IonPage>
      <Header />
      <IonContent className="ion-padding">
        
        {/* Page Title */}
        <div className="data-page-header">
          <h1 className="page-title">A&E Data Insights</h1>
          <p className="page-description">
            Explore emergency department attendance trends using real data. View seasonal trends, 
            compare different factors, and analyze real vs. synthetic datasets.
          </p>
        </div>

        {/* Data Filters */}
        <div className="filter-container">
          <label htmlFor="month-select">Filter by Month:</label>
          <select id="month-select" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            <option value="All">All Months</option>
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>
        </div>

        {/* Data Visualization Section */}
        <div className="data-visualization">
          <h2 className="section-title">Hospital Attendance Trends</h2>
          <p className="section-description">
            View A&E attendance trends across different months, seasons, and factors.
          </p>

          {/* Placeholder for Graph */}
          <div className="graph-container">
            {/* This will later be replaced with a real chart */}
            <p>📊 Graph Placeholder (Actual chart will be inserted here)</p>
          </div>
        </div>

        {/* Real vs. Synthetic Data Comparison */}
        <div className="comparison-section">
          <h2 className="section-title">Real vs. Synthetic Data</h2>
          <p className="section-description">
            Compare real hospital attendance records with AI-generated synthetic data 
            to identify trends and validate predictive models.
          </p>

          {/* Placeholder for Comparison Graph */}
          <div className="comparison-graph">
            <p>📉 Real vs. Synthetic Data Graph Placeholder</p>
          </div>
        </div>

      </IonContent>
    </IonPage>
  );
};

export default AandEData;
