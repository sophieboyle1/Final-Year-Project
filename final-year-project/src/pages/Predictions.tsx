import React, { useEffect, useRef, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import Header from "./Header";
import Chart from "chart.js/auto";
import "./Predictions.css";

// Type definition for individual prediction entries
type PredictionEntry = {
  org_name: string;
  date: string;
  Actual: number | null;
  Predicted: number | null;
};

const Predictions: React.FC = () => {
  // Chart instance reference
  const chartRef = useRef<Chart | null>(null);

  // Model evaluation metrics (R² and MSE)
  const [metrics, setMetrics] = useState<{ r2: number; mse: number } | null>(null);

  // Full prediction dataset
  const [data, setData] = useState<PredictionEntry[]>([]);

  // Hospital trust options for dropdown
  const [orgOptions, setOrgOptions] = useState<string[]>([]);

  // Currently selected hospital trust
  const [selectedOrg, setSelectedOrg] = useState<string>("");

  // Fetch prediction data and populate hospital trust options
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/data/predictions.json");
        const json = await res.json();

        setMetrics({ r2: json.r2, mse: json.mse });

        const predictions: PredictionEntry[] = json.predictions;
        setData(predictions);

        const orgs = Array.from(new Set(predictions.map((p) => p.org_name)));
        setOrgOptions(orgs);
        setSelectedOrg(orgs[0]);
      } catch (err) {
        console.error("❌ Error loading predictions.json:", err);
      }
    };

    fetchData();
  }, []);

  // Update the chart when selected hospital or prediction data changes
  useEffect(() => {
    if (!selectedOrg || data.length === 0) return;

    const filtered = data
      .filter((entry) => entry.org_name === selectedOrg)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const labels = filtered.map((entry) => entry.date);
    const actualData = filtered.map((entry) => entry.Actual);
    const predictedData = filtered.map((entry) => entry.Predicted);

    const ctx = document.getElementById("predictionChart") as HTMLCanvasElement;
    if (ctx) {
      if (chartRef.current) chartRef.current.destroy();

      chartRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels,
          datasets: [
            {
              label: "Actual Attendances",
              data: actualData,
              borderColor: "#3366CC",
              backgroundColor: "transparent",
              borderWidth: 2,
              tension: 0.3,
            },
            {
              label: "Predicted Attendances",
              data: predictedData,
              borderColor: "#FF9800",
              backgroundColor: "transparent",
              borderDash: [5, 5],
              borderWidth: 2,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: `A&E Attendance Forecast - ${selectedOrg}`,
            },
          },
          scales: {
            y: {
              ticks: {
                callback: (val: any) => Number(val).toLocaleString(),
              },
            },
          },
        },
      });
    }
  }, [selectedOrg, data]);

  // Render the page content
  return (
    <IonPage>
      <Header />
      <IonContent className="ion-padding">
        
        {/* Header Section */}
        <section className="predictions-header">
          <h1>A&E Attendance Predictions</h1>
          <p>
            Forecasting future emergency department trends based on cleaned NHS data and machine learning models.
          </p>
        </section>

        {/* Hospital Trust Selection */}
        <section>
          <label htmlFor="org-select">Select Hospital Trust:</label>
          <select
            id="org-select"
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
          >
            {orgOptions.map((org) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>
        </section>

        {/* Forecast Chart */}
        <section className="chart-scroll-section">
          <div className="chart-scroll-container">
            <canvas id="predictionChart"></canvas>
          </div>
        </section>

        {/* Model Performance Metrics */}
        <section className="metrics-section">
          <h2>Model Performance</h2>
          {metrics && (
            <div className="metrics-cards">
              <div className="metric-card">
                <h3>R² Score</h3>
                <p>{metrics.r2.toFixed(2)}</p>
              </div>
              <div className="metric-card">
                <h3>MSE</h3>
                <p>{metrics.mse.toLocaleString()}</p>
              </div>
            </div>
          )}
        </section>

        {/* Methodology Section */}
        <section className="methodology-section">
          <h2>Methodology</h2>
          <p>
            Predictions were generated using a Random Forest Regressor trained on five years of A&E attendance data. I included features like
            rolling averages, month, and past attendances. The model was evaluated using R² and MSE metrics and validated on a 20% test set.
          </p>
          <p>
            Predictions extend from <strong>Jan 2025</strong> to <strong>Dec 2026</strong>, based on synthetic future inputs generated using lag and trend-based features.
          </p>
          <p>
            To explore individual hospital forecasts interactively, check out the Chatbot Page
          </p>
        </section>

      </IonContent>
    </IonPage>
  );
};

export default Predictions;
