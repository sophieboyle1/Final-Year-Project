import React from "react";
import Header from "./Header";

const Predictions = () => {
  return (
    <div className="p-6">
      <Header />
      <h1 className="text-2xl font-bold mb-4">Model Predictions</h1>
      <p className="mb-4">
        Below is the **interactive notebook** displaying the model’s predictions.
      </p>

      {/* Embed the Voila/Binder notebook */}
      <iframe
        src="https://mybinder.org/v2/gh/sophieboyle1/Final-Year-Project/main?filepath=src/predictions.ipynb"
        width="100%"
        height="800px"
        style={{ border: "1px solid #ddd", borderRadius: "8px" }}
      ></iframe>

      <p className="mt-4 text-sm text-gray-600">
        If the notebook doesn’t load, try refreshing or <a href="https://mybinder.org/v2/gh/yourusername/yourrepo/HEAD?filepath=your_notebook.ipynb" className="text-blue-500" target="_blank">open it in a new tab</a>.
      </p>
    </div>
  );
};

export default Predictions;
