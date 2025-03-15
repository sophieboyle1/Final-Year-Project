import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import Card from "../components/Card";

const Predictions = () => {
  const [predictions, setPredictions] = useState<{ actual: number; predicted: number }[]>([]);
  const [mse, setMSE] = useState(0);
  const [r2, setR2] = useState(0);

  // Fetch predictions from JSON file
  useEffect(() => {
    fetch("/path/to/predictions.json") // Adjust this path based on deployment
      .then((response) => response.json())
      .then((data) => setPredictions(data))
      .catch((error) => console.error("Error loading predictions:", error));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Model Predictions</h1>

      <Card className="p-4 mb-6">
        <h2 className="text-lg font-semibold">Actual vs. Predicted</h2>
        <table className="w-full border-collapse border border-gray-300 mt-2">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Actual</th>
              <th className="border p-2">Predicted</th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((row, index) => (
              <tr key={index} className="border">
                <td className="border p-2">{row.actual.toLocaleString()}</td>
                <td className="border p-2">{row.predicted.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold">Prediction Visualization</h2>
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
          layout={{ title: "Actual vs. Predicted Attendance", xaxis: { title: "Index" }, yaxis: { title: "Attendance" } }}
        />
      </Card>
    </div>
  );
};

export default Predictions;
