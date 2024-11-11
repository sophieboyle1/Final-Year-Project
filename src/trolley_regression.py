import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
import seaborn as sns

# Load the dataset
data = pd.read_csv('/Users/sophieboyle/Documents/Final-Year-Project/data/hse_scraped_data.csv')

# Print the initial dataset to understand it better
print("Initial Dataset:")
print(data.head())

# Select the columns needed for regression analysis
columns_to_keep = [
    "Daily Trolley count.2",
    "Delayed Transfers of Care (As of Midnight)",
    "Surge Capacity in Use (Full report @14:00)"
]

data = data[columns_to_keep]

# Print selected columns dataset
print("Selected Columns Dataset:")
print(data.head())

# Remove rows that contain non-numeric values like region names
data = data.apply(pd.to_numeric, errors='coerce')

# Check if dataset contains any NaNs and drop rows that are fully NaN
data.dropna(how='all', inplace=True)

# Fill NaNs with column median or drop rows with NaNs based on specific needs
data.fillna(data.median(), inplace=True)

# Check if the dataset is empty after cleaning
if data.empty:
    raise ValueError("The cleaned dataset is empty. Check the data cleaning process.")

# Print cleaned dataset
print("Cleaned Dataset:")
print(data.head())

# Define the features and the target
X = data[["Delayed Transfers of Care (As of Midnight)", "Surge Capacity in Use (Full report @14:00)"]]
y = data["Daily Trolley count.2"]

# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train the model
model = LinearRegression()
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Evaluate the model
mse = mean_squared_error(y_test, y_pred)
print("Mean Squared Error:", mse)

# Visualize results
plt.figure(figsize=(10, 6))
plt.scatter(y_test, y_pred, color='blue', edgecolor='k')
plt.xlabel("Actual Values")
plt.ylabel("Predicted Values")
plt.title("Actual vs Predicted Values for Patients on Trolleys")
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], color='r', lw=2) 
plt.show()

# Residual plot
residuals = y_test - y_pred
plt.figure(figsize=(10, 6))
plt.scatter(y_pred, residuals, color='green', edgecolor='k')
plt.axhline(0, linestyle='--', color='r')
plt.xlabel("Predicted Values")
plt.ylabel("Residuals")
plt.title("Residual Plot")
plt.show()
