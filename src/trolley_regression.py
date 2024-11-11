import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error
import matplotlib.pyplot as plt
import seaborn as sns

# Load the data
data = pd.read_csv('/Users/sophieboyle/Documents/Final-Year-Project/data/hse_scraped_data.csv')

# Display initial rows to understand data structure
print(data.head())

data = data.loc[:, ~data.columns.str.contains('^Unnamed')]

# Select only numeric columns for use in the model
numeric_data = data.apply(pd.to_numeric, errors='coerce')

# Fill NaN values with mean of respective columns
numeric_data.fillna(numeric_data.mean(), inplace=True)

# Drop any rows that still have NaN values
numeric_data.dropna(inplace=True)

# Feature selection (choose columns relevant for prediction)
# Ensure that these columns actually exist in your cleaned DataFrame
X = numeric_data[[
    "Delayed Transfers of Care (As of Midnight)",
    "Surge Capacity in Use (Full report @14:00)",
    "Daily Trolley count.1",  # Example: ward trolleys
    "No of Total Waiting >24hrs"
]]
y = numeric_data["Daily Trolley count.2"]

# Split data into train and test sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Create and train the model
model = LinearRegression()
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Calculate Mean Squared Error for evaluation
mse = mean_squared_error(y_test, y_pred)
print(f"Mean Squared Error: {mse}")
