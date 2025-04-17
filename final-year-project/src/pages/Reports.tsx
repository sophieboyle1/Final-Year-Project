import React, { useEffect, useRef, useState } from "react";
import { IonContent, IonPage } from "@ionic/react";
import Header from "./Header";
import Chart from "chart.js/auto";
import "./Reports.css";
import icon_calendar from "../assets/icon_calendar.jpg"
import icon_trend from "../assets/icon_trend.jpg"
import icon_lag from "../assets/icon_lag.jpg"
import icon_hospital from "../assets/icon_hospital.jpg"

const Reports: React.FC = () => {
  const anomalyChartRef = useRef<Chart | null>(null);
  const [predictionsData, setPredictionsData] = useState<{ mse: number; r2: number } | null>(null);
  const [selectedHospital, setSelectedHospital] = useState("ALL");
  const [transformationChart, setTransformationChart] = useState<Chart | null>(null);

  // Load Z-score anomalies and prediction data on initial mount
  useEffect(() => {
    // Fetch and render Z-score Anomalies Chart
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
                    callback: (tickValue: any) =>
                      Number(tickValue).toLocaleString(),
                  },
                },
              },
            },
          });
        }
      })
      .catch((err) =>
        console.error("Failed to load zscore_anomalies.json:", err)
      );

    // Fetch prediction performance metrics
    fetch("/data/predictions.json")
      .then((res) => res.json())
      .then((data) => {
        setPredictionsData({
          mse: data.mse,
          r2: data.r2,
        });
      })
      .catch((err) =>
        console.error("Failed to load predictions.json:", err)
      );
  }, []);

  // Handle hospital selection changes
  useEffect(() => {
    loadTransformationData(selectedHospital);
  }, [selectedHospital]);

  // Function to load transformation data
  const loadTransformationData = (hospitalName: string) => {
    console.log("Loading transformation data for hospital:", hospitalName);

    fetch("/data/transformation_by_hospital.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load data: ${res.status} ${res.statusText}`);
        }
        return res.json();
      })
      .then((transformationData) => {
        console.log("Available hospitals:", Object.keys(transformationData));
        updateTransformationChart(hospitalName, transformationData);
      })
      .catch((err) => {
        console.error("Error loading transformation data:", err);
      });
  };

  // Function to update the transformation chart
  const updateTransformationChart = (hospitalName: string, transformationData: any) => {
    // Check if data exists for the selected hospital
    if (!transformationData) {
      console.error("No transformation data available");
      return;
    }

    // Use the selected hospital or fall back to ALL if not found
    const selectedData = transformationData[hospitalName] || transformationData["ALL"];

    if (!selectedData) {
      console.error(`No data found for hospital: ${hospitalName}`);
      console.error("Available options:", Object.keys(transformationData));
      return;
    }

    // Verify the data structure
    if (!selectedData.labels) {
      console.error("Missing 'labels' in data for hospital:", hospitalName);
      console.error("Data structure:", selectedData);
      return;
    }

    const ctx = document.getElementById("transformationChart") as HTMLCanvasElement;

    if (!ctx) {
      console.error("Canvas element for transformation chart not found");
      return;
    }

    // Destroy existing chart to prevent memory leaks
    if (transformationChart) {
      transformationChart.destroy();
    }

    // Accommodate both data structures (original format or datasets format)
    const datasets = selectedData.datasets || [
      {
        label: "Original Data",
        data: selectedData.original || [],
        borderColor: "#999",
        fill: false,
      },
      {
        label: "Cleaned Data",
        data: selectedData.cleaned || [],
        borderColor: "#3366CC",
        fill: false,
      },
      {
        label: "Rolling Average",
        data: selectedData.rolling || [],
        borderColor: "#FF9900",
        fill: false,
      },
    ];

    const newChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: selectedData.labels,
        datasets: datasets,
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Data Transformation for ${hospitalName}`,
          },
        },
        scales: {
          y: {
            ticks: {
              callback: (tickValue: any) =>
                Number(tickValue).toLocaleString(),
            },
          },
        },
      },
    });

    setTransformationChart(newChart);
  };

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
            You'll find explanations on how missing months were handled, how synthetic values were generated, what feature engineering techniques were applied, and why these steps were crucial for producing accurate and reliable predictions.
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

        <section className="report-section">
          <h2>Model Training & Evaluation</h2>
          <p>
            To forecast future A&E attendances, I trained a <strong>Random Forest Regressor</strong> on 80% of the cleaned dataset, leaving the remaining 20% for testing. This model was selected after comparing several alternatives and balancing accuracy, speed, and interpretability.
          </p>

          <table className="metrics-table">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>R² Score</strong></td>
                <td>{predictionsData ? predictionsData.r2.toFixed(2) : "Loading..."}</td>
                <td>Explains approximately <strong>{predictionsData ? (predictionsData.r2 * 100).toFixed(1) + "%" : ""}</strong> of the variance in A&E attendances — a solid fit for real-world forecasting.</td>
              </tr>
              <tr>
                <td><strong>MSE</strong></td>
                <td>{predictionsData ? predictionsData.mse.toFixed(2) : "Loading..."}</td>
                <td>The average squared difference between actual and predicted values, measuring model error.</td>
              </tr>
            </tbody>
          </table>

          <p>
            While simpler models like Linear Regression performed well during evaluation, the Random Forest offered better robustness across unpredictable events. Deep learning approaches like LSTM were tested but required more data and tuning to outperform traditional methods.
          </p>

          <p>
            The most impactful features during training were: <strong>recent attendance trends</strong>, <strong>month of the year</strong>, and <strong>lag values</strong> that captured historical patterns.
          </p>
        </section>

        <section className="report-section">
          <h2>Feature Engineering</h2>
          <p>
            Raw A&E attendance data alone wasn't enough — I engineered new features to help the machine learning model learn patterns more effectively. These features added context, captured seasonality, and improved accuracy.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <img src={icon_calendar} alt="Time Features" className="feature-icon" />
              <h3>Time-Based Features</h3>
              <p>
                Extracted <strong>month</strong>, <strong>year</strong>, <strong>day of week</strong>, and <strong>season</strong> to reflect predictable seasonal trends in A&E activity.
              </p>
            </div>

            <div className="feature-item">
              <img src={icon_trend} alt="Rolling Averages" className="feature-icon" />
              <h3>Rolling Averages</h3>
              <p>
                Calculated <strong>3-month moving averages</strong> to capture recent trends and smooth out short-term spikes or drops.
              </p>
            </div>

            <div className="feature-item">
              <img src={icon_lag} alt="Lag Features" className="feature-icon" />
              <h3>Lag Features</h3>
              <p>
                Included attendances from previous months (<strong>1-month and 3-month lags</strong>) to help the model learn from historical patterns.
              </p>
            </div>

            <div className="feature-item">
              <img src={icon_hospital} alt="Hospital Metadata" className="feature-icon" />
              <h3>Hospital Metadata</h3>
              <p>
                Incorporated <strong>organization size</strong>, <strong>type</strong>, and <strong>region</strong> to adjust for variation between facilities.
              </p>
            </div>
          </div>
        </section>

        <section className="report-section">
          <h2>Data Transformation Explorer</h2>
          <p>
            See how raw A&E data was transformed for model training. Select a hospital to view the data cleaning process.
          </p>

          <select
            className="hospital-selector"
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
          >
            <option value="ALL">All Hospitals</option>
            <option value="Liverpool University Hospitals">Liverpool University Hospitals</option>
            <option value="Manchester University NHS Trust">Manchester University NHS Trust</option>
            <option value="University Hospitals Birmingham">University Hospitals Birmingham</option>
          </select>

          <div className="transformation-chart-container" style={{ height: "300px", maxWidth: "100%", marginTop: "20px" }}>
            <canvas id="transformationChart"></canvas>
          </div>
        </section>

        <section className="report-section">
          <h2>COVID-19 Impact Analysis</h2>
          <div className="covid-analysis">
            <div className="covid-phase">
              <h3>Initial Lockdown (Mar-Jun 2020)</h3>
              <p>A&E attendances dropped by up to 57%, creating statistical outliers requiring special handling.</p>
            </div>
            <div className="covid-phase">
              <h3>Recovery (Jul 2020-Feb 2021)</h3>
              <p>Gradual return to ~85% of pre-pandemic levels with significant month-to-month volatility.</p>
            </div>
            <div className="covid-phase">
              <h3>New Normal (Mar 2021+)</h3>
              <p>Stabilized below pre-pandemic levels with altered seasonal patterns requiring model recalibration.</p>
            </div>
          </div>
        </section>

        <section className="report-section">
          <h2>Future Improvements</h2>
          <ul className="improvements-list">
            <li>
              <strong>External Data Integration</strong> - Weather patterns, public holidays, and local events
            </li>
            <li>
              <strong>Admission Type Breakdown</strong> - Separate models for different A&E admission types
            </li>
            <li>
              <strong>Regional Modeling</strong> - Region-specific models for local attendance variations
            </li>
            <li>
              <strong>Extended Forecasting</strong> - Predictions beyond 2026 with increasing confidence intervals
            </li>
            <li>
              <strong>Scenario Planning</strong> - "What-if" tools for resource allocation
            </li>
          </ul>
        </section>

        <section className="report-section">
          <h2>Technical Methodology</h2>

          <p>
            To determine the most suitable algorithm for A&E forecasting, I experimented with multiple models and evaluated them using key performance metrics. Each model was trained on the same feature-engineered dataset to ensure a fair comparison.
          </p>

          <table className="model-comparison-table">
            <thead>
              <tr>
                <th>Model</th>
                <th>R² Score</th>
                <th>MSE</th>
                <th>Training Time</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Linear Regression</td>
                <td>0.59</td>
                <td>33,412,823</td>
                <td>0.3s</td>
                <td>Fast and interpretable; performed well but limited on non-linear patterns.</td>
              </tr>
              <tr>
                <td>Random Forest</td>
                <td>0.58</td>
                <td>34,400,033</td>
                <td>2.7s</td>
                <td>Robust to overfitting; chosen for final deployment due to consistent results.</td>
              </tr>
              <tr>
                <td>XGBoost</td>
                <td>0.54</td>
                <td>37,359,422</td>
                <td>1.8s</td>
                <td>Handled variance well but offered no significant gains over Random Forest.</td>
              </tr>
              <tr>
                <td>LSTM Neural Network</td>
                <td>-1.68</td>
                <td>217,542,179</td>
                <td>45.2s</td>
                <td>Underperformed due to limited sequence depth and data sparsity.</td>
              </tr>
            </tbody>
          </table>

          <p>
            The Random Forest model was ultimately chosen for its strong balance between accuracy, resilience to noisy data, and interpretability. Hyperparameter tuning was performed via grid search using 5-fold cross-validation.
          </p>
        </section>
        <footer style={{ marginTop: "2rem", padding: "1rem", textAlign: "center", color: "#888" }}>
          © 2025 NHS A&E Data Insights – Final Year Project by Sophie Boyle
        </footer>
      </IonContent>
    </IonPage>
  );
};

export default Reports;