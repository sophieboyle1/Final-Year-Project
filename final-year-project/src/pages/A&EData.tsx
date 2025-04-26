import React, { useEffect, useState, useRef } from "react";
import { IonContent, IonPage } from '@ionic/react';
import Header from "./Header";
import "./AandEData.css";
import Chart from "chart.js/auto";
import './global.css';

const AandEData: React.FC = () => {
  const [summaryData, setSummaryData] = useState<{
    total_attendances: number;
    hospital_systems: number;
    date_range: string;
    months_analyzed: number;
  } | null>(null);

  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const colorPalette = ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099"];
  const chartRef = useRef<Chart | null>(null);
  const seasonalChartRef = useRef<Chart | null>(null);
  const performanceChartRef = useRef<Chart | null>(null);
  const topHospitalsChartRef = useRef<Chart | null>(null);
  const bottomHospitalsChartRef = useRef<Chart | null>(null);


  useEffect(() => {
    // Load summary stats
    fetch("/data/ae_summary.json")
      .then((res) => res.json())
      .then((data) => setSummaryData(data))
      .catch((err) => console.error("Failed to load ae_summary.json:", err));

    // Load monthly attendance trends
    fetch("/data/monthly_attendance.json")
      .then((res) => res.json())
      .then((data) => {
        const ctx = document.getElementById("monthlyTrendsChart") as HTMLCanvasElement;
        if (ctx) {
          if (chartRef.current) chartRef.current.destroy();
          chartRef.current = new Chart(ctx, {
            type: "line",
            data: {
              labels: data.labels,
              datasets: data.datasets.map((item: any, index: number) => ({
                ...item,
                borderColor: colorPalette[index % colorPalette.length],
                backgroundColor: "transparent",
                tension: 0.3,
              })),
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: "Monthly A&E Attendances (Millions)",
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  suggestedMax: 5,
                  ticks: {
                    stepSize: 0.5,
                    callback: (value: any) => `${value.toFixed(1)}`,
                  },
                },
              },
            },
          });
        }
      })
      .catch((err) => console.error("Failed to load monthly_attendance.json:", err));

    // Load seasonal attendance trends
    fetch("/data/seasonal_attendance.json")
      .then((res) => res.json())
      .then((seasonalData) => {
        const seasonCtx = document.getElementById("seasonalChart") as HTMLCanvasElement;
        if (seasonCtx) {
          if (seasonalChartRef.current) seasonalChartRef.current.destroy();
          seasonalChartRef.current = new Chart(seasonCtx, {
            type: "bar",
            data: {
              labels: seasonalData.labels,
              datasets: seasonalData.datasets.map((dataset: any, index: number) => ({
                ...dataset,
                backgroundColor: colorPalette[index % colorPalette.length],
              })),
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: "Seasonal A&E Attendance Patterns (2020–2024)",
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value: any) => `${value.toFixed(1)}M`,
                  },
                },
              },
            },
          });
        }
      })
      .catch((err) => console.error("Failed to load seasonal_attendance.json:", err));

    // Load performance trend chart
    fetch("/data/performance_trend.json")
      .then((res) => res.json())
      .then((performanceData) => {
        const performanceCtx = document.getElementById("performanceChart") as HTMLCanvasElement;
        if (performanceCtx) {
          if (performanceChartRef.current) performanceChartRef.current.destroy();
          performanceChartRef.current = new Chart(performanceCtx, {
            type: "bar",
            data: performanceData,
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: "4-Hour Wait Time Performance",
                },
              },
              scales: {
                y: {
                  min: 85,
                  max: 100,
                  ticks: {
                    callback: (value: any) => `${value}%`,
                  },
                },
              },
            },
          });
        }
      })
      .catch((err) => console.error("Failed to load performance_trend.json:", err));

    // Load patient pathway funnel chart
    fetch("/data/funnel_data.json")
      .then((res) => res.json())
      .then((funnelData) => {
        const funnelCtx = document.getElementById("funnelChart") as HTMLCanvasElement;
        if (funnelCtx) {
          new Chart(funnelCtx, {
            type: "bar",
            data: {
              labels: funnelData.stages,
              datasets: [
                {
                  label: "Patient Flow",
                  data: funnelData.values,
                  backgroundColor: ["#3366CC", "#66AA00", "#FF9900"],
                },
              ],
            },
            options: {
              indexAxis: "y",
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: "Patient Pathway Funnel: A&E to Admission",
                },
                legend: {
                  display: true,
                  position: "top",
                },
              },
              scales: {
                x: {
                  ticks: {
                    callback: function (tickValue: number | string) {
                      const num = typeof tickValue === "number" ? tickValue : parseFloat(tickValue);
                      return num.toLocaleString();
                    }
                  },
                },
              },
            },
          });
        }
      })
      .catch((err) => console.error("Failed to load funnel_data.json:", err));

    fetch("/data/regional_comparison.json")
      .then((res) => res.json())
      .then((regionalData) => {
        const topCtx = document.getElementById("topHospitalsChart") as HTMLCanvasElement;
        const bottomCtx = document.getElementById("bottomHospitalsChart") as HTMLCanvasElement;

        if (topCtx) {
          if (topHospitalsChartRef.current) topHospitalsChartRef.current.destroy();
          topHospitalsChartRef.current = new Chart(topCtx, {
            type: "bar",
            data: {
              labels: regionalData.top_5.map((d: any) => d.org_name),
              datasets: [{
                label: "Total Attendances",
                data: regionalData.top_5.map((d: any) => d.attendances),
                backgroundColor: "#3366CC",
              }],
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: "Top 5 Hospital Systems by A&E Attendances",
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

        if (bottomCtx) {
          if (bottomHospitalsChartRef.current) bottomHospitalsChartRef.current.destroy();
          bottomHospitalsChartRef.current = new Chart(bottomCtx, {
            type: "bar",
            data: {
              labels: regionalData.bottom_5.map((d: any) => d.org_name),
              datasets: [{
                label: "Total Attendances",
                data: regionalData.bottom_5.map((d: any) => d.attendances),
                backgroundColor: "#DC3912",
              }],
            },
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: "Bottom 5 Hospital Systems by A&E Attendances",
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
      .catch((err) => console.error("Failed to load top_bottom_hospitals.json:", err));

  }, []);



  return (
    <IonPage>
      <Header />
      <IonContent fullscreen>
        {/* Overview */}
        <section className="data-overview">
          <h2>NHS A&E Data Analysis (2020–2024)</h2>
          <div className="stats-row">
            <div className="stat-box">
              {summaryData ? `${(summaryData.total_attendances / 1_000_000).toFixed(1)}M Total Attendances` : "Loading..."}
            </div>
            <div className="stat-box">
              {summaryData ? `${summaryData.hospital_systems} Hospital Systems` : "Loading..."}
            </div>
            <div className="stat-box">
              {summaryData ? `${summaryData.months_analyzed} Months Analyzed` : "Loading..."}
            </div>
          </div>
          <p>
            Comprehensive analysis of NHS England's A&E attendance data from {summaryData?.date_range || "…"}.
          </p>
        </section>

        {/* Monthly Visual */}
        <section className="key-visualizations">
          <h2>Key Findings</h2>

          {/* First row: Monthly + Seasonal */}
          <div className="viz-container">
            <div className="viz-card">
              <h3>Monthly A&E Attendance Patterns</h3>
              <canvas id="monthlyTrendsChart" style={{ height: "400px" }}></canvas>
              <p>
                Seasonal patterns reveal consistent attendance spikes during winter months,
                with notable disruption during COVID-19 lockdowns in 2020.
              </p>
            </div>

            <div className="viz-card">
              <h3>Seasonal Attendance Patterns</h3>
              <canvas id="seasonalChart" style={{ height: "400px" }}></canvas>
              <p>
                Across the five-year span, Winter consistently shows the highest A&E attendance,
                with peaks surpassing Spring by an average of 15–20%. This trend is particularly
                evident in 2020 and 2024. Recognizing this seasonal surge is crucial for NHS hospitals
                in forecasting demand, optimizing staff deployment, and managing emergency resources effectively.
              </p>
            </div>
          </div>

          {/* Second row: Performance + Funnel */}
          <div className="viz-container">
            <div className="viz-card">
              <h3>A&E Performance Trends</h3>
              <canvas id="performanceChart" style={{ height: "400px" }}></canvas>
              <p>
                After consistently strong performance since 2020, the percentage of patients seen within the 4-hour target has remained above 90%, with a slight upward trend from 91.8% in 2020 to 94.0% by 2024. This stable and high performance reflects ongoing efforts to maintain emergency care efficiency across NHS hospitals despite increasing patient demand.
              </p>
            </div>

            <div className="viz-card">
              <h3>Patient Pathway Funnel</h3>
              <canvas id="funnelChart" style={{ height: "400px" }}></canvas>
              <p>
                The funnel chart illustrates the patient journey through A&E services. Out of approximately 121 million attendances, around 94% were seen within 4 hours, highlighting strong performance on initial triage and treatment. Of those, nearly 49% progressed to hospital admission, revealing the volume of cases requiring escalated care.
              </p>
            </div>
          </div>

          {/* Third row: Regional Comparison */}
          <div className="viz-container">
            <div className="viz-card">
              <h3>Top 5 Urban NHS Hospital Systems – Highest A&E Demand</h3>
              <canvas id="topHospitalsChart" style={{ height: "400px" }}></canvas>
              <p>These major urban trusts handled the largest A&E volumes nationally, driven by dense populations and high service capacity.</p>
            </div>

            <div className="viz-card">
              <h3>Bottom 5 Rural or Specialist NHS Sites – Lowest A&E Demand</h3>
              <canvas id="bottomHospitalsChart" style={{ height: "400px" }}></canvas>
              <p>These smaller rural or specialist hospitals recorded the lowest A&E attendances, reflecting their limited emergency provision or narrower care roles.</p>
            </div>
          </div>

          {/* Comparative Insight */}
          <div className="viz-summary">
            <p>
              <strong>Comparison:</strong> The difference between the top and bottom systems is stark—urban trusts like Barts Health saw over <strong>2 million attendances</strong>,
              while the smallest rural sites recorded fewer than <strong>10,000</strong>. This highlights the uneven distribution of A&E demand across the NHS and
              the importance of region-specific resource planning.
            </p>
          </div>
        </section>


        {/* Data Insights Section */}
        <section className="data-insights">
          <h2>Data Analysis Methodology</h2>
          <div className="method-cards">
            <div className="method-card">
              <h3>Data Collection</h3>
              <p>
                Data was collected from NHS England's statistical work area, covering 60 months
                from January 2020 to December 2024. The dataset includes attendance figures
                across 268 hospital systems throughout England.
              </p>
            </div>

            <div className="method-card">
              <h3>Data Cleaning Process</h3>
              <p>
                The analysis pipeline included robust data cleaning procedures to handle missing values,
                outliers, and inconsistencies. Statistical techniques were applied to identify and
                address anomalies, particularly during the COVID-19 period.
              </p>
            </div>
          </div>

          {/* Key insight */}
          <div className="finding-container">
            <h3>Key Finding: Impact of External Factors</h3>
            <div className="finding-text">
              <p>
                My analysis revealed several external factors significantly impacting A&E attendance:
              </p>
              <ul>
                <li>
                  <strong>COVID-19 Impact:</strong> A dramatic 54% decrease in A&E attendances during
                  April 2020, followed by a gradual recovery over the following 18 months.
                </li>
                <li>
                  <strong>Seasonal Patterns:</strong> Consistent winter peaks correlating with
                  respiratory illness seasons, with January typically showing the highest attendance.
                </li>
                <li>
                  <strong>Regional Variations:</strong> Significant differences in attendance patterns
                  between urban and rural hospital systems, with urban centers experiencing 28% higher
                  relative demand.
                </li>
              </ul>
              <p>
                These insights provide valuable information for resource planning and policy making
                in emergency care settings.
              </p>
            </div>
          </div>
        </section>

        <footer style={{ marginTop: "2rem", padding: "1rem", textAlign: "center", color: "#888" }}>
          © 2025 NHS A&E Data Insights – Final Year Project by Sophie Boyle
        </footer>
      </IonContent>
    </IonPage>
  );
};

export default AandEData;