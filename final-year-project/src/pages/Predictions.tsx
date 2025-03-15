import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Header from "./Header";

const Predictions = () => {
  const [predictions, setPredictions] = useState<{ Actual: number; Predicted: number }[]>([]);
  const [mse, setMSE] = useState<number | null>(null);
  const [r2, setR2] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/predictions.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setPredictions(data.predictions || []);
        setMSE(data.mse ?? null);
        setR2(data.r2 ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error loading predictions:", error);
        setError("Failed to load predictions data.");
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-6">
      <Header />
      <h1 className="text-2xl font-bold mb-4">Model Predictions</h1>

      {loading ? (
        <p>Loading predictions...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          <p>
            MSE: {mse !== null ? mse.toFixed(2) : "N/A"} | R²: {r2 !== null ? r2.toFixed(2) : "N/A"}
          </p>

          <div>
            <h2 className="text-lg font-semibold">Actual vs. Predicted</h2>
            <table className="w-full border-collapse border border-gray-300 mt-2">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Actual</th>
                  <th className="border p-2">Predicted</th>
                </tr>
              </thead>
              <tbody>
                {predictions.length > 0 ? (
                  predictions.map((row, index) => (
                    <tr key={index} className="border">
                      <td className="border p-2">{row.Actual.toLocaleString()}</td>
                      <td className="border p-2">{row.Predicted.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="border p-2 text-center">
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Prediction Visualization</h2>
            {predictions.length > 0 ? (
              <Plot
                data={[
                  {
                    x: predictions.map((_, i) => i),
                    y: predictions.map((p) => p.Actual),
                    type: "scatter",
                    mode: "lines+markers",
                    name: "Actual",
                  },
                  {
                    x: predictions.map((_, i) => i),
                    y: predictions.map((p) => p.Predicted),
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
            ) : (
              <p>No predictions available for visualization.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Predictions;
