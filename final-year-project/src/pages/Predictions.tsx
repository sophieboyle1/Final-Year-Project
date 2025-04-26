import React, { useEffect, useRef, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import Header from "./Header";
import Chart from "chart.js/auto";
import "./Predictions.css";

// Define type for prediction entries
type PredictionEntry = {
  org_name: string;
  date: string;
  Actual: number | null;
  Predicted: number | null;
};

const Predictions: React.FC = () => {
  const chartRef = useRef<Chart | null>(null);
  const [metrics, setMetrics] = useState<{ r2: number; mse: number } | null>(null);
  const [data, setData] = useState<PredictionEntry[]>([]);
  const [orgOptions, setOrgOptions] = useState<string[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");

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

  // Filter options based on search text
  const filteredOptions = orgOptions.filter((org) =>
    org.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <IonPage>
      <Header />
      <IonContent className="ion-padding">
        <section className="predictions-header">
          <h1>A&E Attendance Predictions</h1>
          <p>
            Forecasting future emergency department trends based on cleaned NHS data and machine learning models.
          </p>
        </section>

        <section>
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search Hospital Trust..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              marginBottom: "12px",
              padding: "10px",
              width: "100%",
              maxWidth: "400px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          />

          {/* Hospital Dropdown */}
          <select
            id="org-select"
            value={selectedOrg}
            onChange={(e) => setSelectedOrg(e.target.value)}
            style={{
              padding: "10px",
              width: "100%",
              maxWidth: "400px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "1rem",
            }}
          >
            {filteredOptions.map((org) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>
        </section>

        {/* Chart */}
        <section className="chart-scroll-section">
          <div className="chart-scroll-container">
            <canvas id="predictionChart"></canvas>
          </div>
        </section>

        {/* Metrics */}
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

        {/* Methodology */}
        <section className="methodology-section">
          <h2>Methodology</h2>
          <p>
            Predictions were generated using a Random Forest Regressor trained on five years of A&E attendance data. Features like rolling averages, month, and past attendances were used. The model was evaluated using R² and MSE metrics.
          </p>
          <p>
            Predictions extend from <strong>Feb 2024</strong> to <strong>Dec 2026</strong> using synthetic future inputs generated from lagged trends.
          </p>
          <p>
            Explore individual forecasts interactively via the{" "}
            <a href="/chatbot" className="chatbot-link">Chatbot Page</a>.
          </p>
        </section>

        {/* Footer */}
        <footer style={{ marginTop: "2rem", padding: "1rem", textAlign: "center", color: "#888" }}>
          © 2025 NHS A&E Data Insights – Final Year Project by Sophie Boyle
        </footer>
      </IonContent>
    </IonPage>
  );
};

export default Predictions;
