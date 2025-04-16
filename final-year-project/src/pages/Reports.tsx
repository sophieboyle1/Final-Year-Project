import React, { useEffect, useRef } from "react";
import { IonContent, IonPage } from "@ionic/react";
import Header from "./Header";
import Chart from "chart.js/auto";
import "./Reports.css";

const Reports: React.FC = () => {
  const anomalyChartRef = useRef<Chart | null>(null);

  useEffect(() => {
    fetch("/data/zscore_anomalies.json")
      .then((res) => res.json())
      .then((data) => {
        const ctx = document.getElementById("zscoreChart") as HTMLCanvasElement;
        if (ctx) {
          if (anomalyChartRef.current) anomalyChartRef.current.destroy();
          anomalyChartRef.current = new Chart(ctx, {
            type: "line",
            data: {
              labels: data.labels,
              datasets: data.datasets,
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: "Z-Score Anomalies in A&E Attendances",
                },
              },
              scales: {
                y: {
                  ticks: {
                    callback: (tickValue: any) => Number(tickValue).toLocaleString(),
                  },
                },
              },
            },
          });
        }
      })
      .catch((err) => console.error("Failed to load zscore_anomalies.json:", err));
  }, []);

  return (
    <IonPage>
      <Header />
      <IonContent className="ion-padding">
        <section className="reports-intro">
          <h2>Technical Reports & Data Preprocessing</h2>
          <p>
            This section provides a detailed breakdown of the technical work that powered the A&E data analysis and prediction models. While the A&E Data Page highlights key findings, this page focuses on the behind-the-scenes processes: how raw NHS data was cleaned, enhanced, and transformed into a structured format suitable for machine learning.
          </p>
          <p>
            You’ll find explanations on how missing months were handled, how synthetic values were generated, what feature engineering techniques were applied, and why these steps were crucial for producing accurate and reliable predictions.
          </p>
          <p>
            All cleaned and engineered data was prepared locally, exported as JSON, and then hosted on Microsoft Azure Blob Storage. The frontend application fetches this data dynamically at runtime, ensuring that visualizations and predictions are based on up-to-date, structured datasets — without hardcoding values.
          </p>
        </section>

        <section className="report-section">
          <h2>Data Cleaning Pipeline</h2>
          <p>
            The A&E dataset was cleaned and transformed through a multi-step process to address missing data, anomalies,
            and formatting issues. Each step ensured the final dataset was complete and consistent over 60 months.
          </p>

          <div className="cleaning-cards">
            <div className="card">
              <img src="/images/icon_date.png" alt="Date Parsing" />
              <h3>Date Parsing</h3>
              <p>Merged <code>year</code> and <code>month</code> into a single <code>date</code> field for consistent time-series analysis.</p>
            </div>

            <div className="card">
              <img src="/images/icon_missing.png" alt="Missing Data" />
              <h3>Missing Data</h3>
              <p>Detected and flagged gaps in the monthly timeline using row counts and timestamp tracking.</p>
            </div>

            <div className="card">
              <img src="/images/icon_synthetic.png" alt="Synthetic Filling" />
              <h3>Synthetic Filling</h3>
              <p>Used linear interpolation and domain knowledge to fill missing or corrupt data while preserving trends.</p>
            </div>

            <div className="card">
              <img src="/images/icon_zscore.png" alt="Z-score Detection" />
              <h3>Z-Score Detection</h3>
              <p>Flagged unusually high or low values (like April 2020 or July 2021) based on statistical deviation.</p>
            </div>

            <div className="card">
              <img src="/images/icon_flags.png" alt="Outlier Flags" />
              <h3>Outlier Flags</h3>
              <p>Tagged rows with <code>is_outlier</code> or <code>is_anomaly</code> for downstream filtering and model training.</p>
            </div>
          </div>
        </section>


        <section className="report-section">
          <h2>Z-Score Anomalies Chart</h2>
          <div style={{ height: "250px", maxWidth: "100%" }}>
            <canvas id="zscoreChart"></canvas>
          </div>

          <p>
            This chart plots the full time series of A&E attendances and visually highlights statistical anomalies detected via z-score analysis. Spikes above or below the trendline represent periods where attendances were significantly different from expected seasonal behavior — such as April 2020. These insights helped identify external impacts and smooth irregularities in model training.

            ⚠️ The red dot in July 2021 highlights an anomaly likely caused by synthetic data filling during a month with missing or corrupted values. Z-score detection flagged it as an outlier due to an unexpected drop in attendances.
          </p>
        </section>
      </IonContent>
    </IonPage>
  );
};

export default Reports;
