import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Header from "./Header"; // ✅ Added Header component
import Card from "../components/Card"; // ✅ Ensured correct import

const Predictions = () => {
  const [predictions, setPredictions] = useState<{ actual: number; predicted: number }[]>([]);
  const [mse, setMSE] = useState<number | null>(null);
  const [r2, setR2] = useState<number | null>(null);

  // Fetch predictions and model performance metrics
  useEffect(() => {
    fetch("/data/predictions.json") // ✅ Ensure correct path for deployment
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.predictions)) {
          setPredictions(data.predictions);
          setMSE(data.mse);
          setR2(data.r2);
        } else {
          console.error("Invalid predictions data format:", data);
        }
      })
      .catch((error) => console.error("Error loading predictions:", error));
  }, []);

  return (
    <div>
      {/* ✅ Header added at the top */}
      <Header />

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">📊 Model Predictions</h1>

        {/* ✅ Model Performance Metrics */}
        <Card className="p-4 mb-6">
          <h2 className="text-lg font-semibold">📈 Model Performance</h2>
          <p><strong>Mean Squared Error (MSE):</strong> {mse ? mse.toFixed(2) : "Loading..."}</p>
          <p><strong>R² Score:</strong> {r2 ? r2.toFixed(2) : "Loading..."}</p>
        </Card>

        {/* ✅ Actual vs. Predicted Table */}
        <Card className="p-4 mb-6">
          <h2 className="text-lg font-semibold">🔍 Actual vs. Predicted</h2>
          <table className="w-full border-collapse border border-gray-300 mt-2">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Actual</th>
                <th className="border p-2">Predicted</th>
              </tr>
            </thead>
            <tbody>
              {predictions.slice(0, 10).map((row, index) => ( // ✅ Limit table to 10 rows for performance
                <tr key={index} className="border">
                  <td className="border p-2">{row.actual.toLocaleString()}</td>
                  <td className="border p-2">{row.predicted.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* ✅ Prediction Visualization */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold">📊 Prediction Visualization</h2>
          <Plot
            data={[
              {
                x: predictions.map((_, i) => i),
                y: predictions.map((p) => p.actual),
                type: "scatter",
                mode: "lines+markers",
                name: "Actual",
              },
              {
                x: predictions.map((_, i) => i),
                y: predictions.map((p) => p.predicted),
                type: "scatter",
                mode: "lines+markers",
                name: "Predicted",
              },
            ]}
            layout={{
              title: "Actual vs. Predicted Attendance",
              xaxis: { title: "Index" },
              yaxis: { title: "Attendance" },
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default Predictions;
