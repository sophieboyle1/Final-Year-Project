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
            The original NHS A&E dataset contained several quality issues, including missing months,
            inconsistent formatting, and outliers introduced during the COVID-19 period. To ensure a
            reliable foundation for analysis and modelling, a multi-step data cleaning process was applied:
          </p>
          <ul>
            <li><strong>Date Parsing & Consistency:</strong> Combined separate <code>year</code> and <code>month</code> columns into a single <code>date</code> field for easier time-based operations.</li>
            <li><strong>Missing Data Identification:</strong> Detected gaps in the time series, especially in early 2020 and mid-2022, using row counts and timestamp gaps.</li>
            <li><strong>Synthetic Data Filling:</strong> Generated synthetic rows using linear interpolation and domain-informed averages to fill missing/corrupt months. This preserved overall trends while smoothing volatility.</li>
            <li><strong>Z-score Detection:</strong> Applied statistical z-score analysis to flag anomalous spikes or drops, which were reviewed and optionally corrected if inconsistent with neighboring months.</li>
            <li><strong>Outlier Tagging:</strong> Added flags (<code>is_outlier</code>, <code>is_anomaly</code>) to track cleaned rows for transparency and potential exclusion during model training.</li>
          </ul>
          <p>
            These steps ensured a complete, clean time series of 60 months across all hospitals. The final
            dataset was then used to generate feature-engineered versions and JSON exports for the dashboard.
          </p>
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
