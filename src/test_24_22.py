import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# Load the merged dataset (Change file name if needed)
FILE_NAME = "nhs_ae_merged.csv"  # Replace with actual file name
nhs_data = pd.read_csv(FILE_NAME)

# -------------------------------
# 🔍 Step 1: Quick Data Inspection
# -------------------------------
print("\n🔹 First 5 Rows of the Dataset:")
print(nhs_data.head())

print("\n🔹 Dataset Shape (Rows, Columns):", nhs_data.shape)

# -------------------------------
# 🔹 Step 2: Check for Missing Values
# -------------------------------
print("\n🔹 Missing Values per Column:")
print(nhs_data.isnull().sum())

# Drop columns with excessive missing values (> 90%)
missing_threshold = 0.90 * len(nhs_data)
columns_to_drop = nhs_data.columns[nhs_data.isnull().sum() > missing_threshold]
if len(columns_to_drop) > 0:
    print(f"\n⚠ Dropping {len(columns_to_drop)} columns with >90% missing values.")
    nhs_data.drop(columns=columns_to_drop, inplace=True)

# Fill remaining missing values with 0
nhs_data.fillna(0, inplace=True)

# -------------------------------
# 🔹 Step 3: Check Data Types
# -------------------------------
print("\n🔹 Column Data Types:")
print(nhs_data.dtypes)

# Convert 'year' to string if needed
nhs_data["year"] = nhs_data["year"].astype(str)

# Convert percentage column to float
if "percentage_seen_within_4_hours" in nhs_data.columns:
    nhs_data["percentage_seen_within_4_hours"] = nhs_data["percentage_seen_within_4_hours"].astype(float)

# -------------------------------
# 🔹 Step 4: Check for Invalid Values
# -------------------------------
# Ensure percentage values are between 0-100
if "percentage_seen_within_4_hours" in nhs_data.columns:
    nhs_data = nhs_data[(nhs_data["percentage_seen_within_4_hours"] >= 0) &
                        (nhs_data["percentage_seen_within_4_hours"] <= 100)]

# Check for negative values in attendance columns
attendance_columns = [col for col in nhs_data.columns if "attendances" in col or "admissions" in col]
for col in attendance_columns:
    if (nhs_data[col] < 0).any():
        print(f"⚠ Warning: Negative values found in {col}")

# -------------------------------
# 🔹 Step 5: Check Unique Values in Key Columns
# -------------------------------
print("\n🔹 Unique Months:", nhs_data["month"].unique())
print("🔹 Unique Years:", nhs_data["year"].unique())

# -------------------------------
# 📊 Step 6: Quick Data Visualization
# -------------------------------

# 1️⃣ Distribution of "Percentage Seen Within 4 Hours"
plt.figure(figsize=(12, 6))
sns.histplot(nhs_data["percentage_seen_within_4_hours"], bins=20, kde=True)
plt.xlabel("Percentage Seen Within 4 Hours")
plt.ylabel("Count")
plt.title("Distribution of Percentage Seen Within 4 Hours (2022-2024)")
plt.show()

# 2️⃣ Monthly Trend of Percentage Seen Within 4 Hours
plt.figure(figsize=(14, 6))
sns.boxplot(data=nhs_data, x="month", y="percentage_seen_within_4_hours", hue="year", order=[
    'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
])
plt.xlabel("Month")
plt.ylabel("Percentage Seen Within 4 Hours")
plt.title("Monthly Trends in A&E Performance (2022-2024)")
plt.legend(title="Year")
plt.xticks(rotation=45)
plt.show()

# 3️⃣ Yearly Performance Comparison
plt.figure(figsize=(10, 5))
sns.boxplot(data=nhs_data, x="year", y="percentage_seen_within_4_hours")
plt.xlabel("Year")
plt.ylabel("Percentage Seen Within 4 Hours")
plt.title("A&E Performance Over the Years (2022-2024)")
plt.show()

# -------------------------------
# ✅ Final Summary
# -------------------------------
print("\n✅ Data Testing & Visualization Complete!")