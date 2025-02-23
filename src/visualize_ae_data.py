import pandas as pd
import matplotlib.pyplot as plt

# Load the cleaned dataset
file_path = "cleaned_nhs_ae_data.csv"
df = pd.read_csv(file_path)

# Convert Month column to integer
df["Month"] = df["Month"].astype(int)

# Aggregate attendances by year and month
monthly_attendances = df.groupby(["Year", "Month"])["Total Attendances"].sum().reset_index()

# Create a time series plot
plt.figure(figsize=(12, 6))
plt.plot(
    monthly_attendances.index, 
    monthly_attendances["Total Attendances"], 
    marker="o", 
    linestyle="-", 
    color="b"
)
plt.xlabel("Time (Months)")
plt.ylabel("Total Attendances")
plt.title("A&E Attendances Over Time (Monthly)")
plt.grid()
plt.show()
