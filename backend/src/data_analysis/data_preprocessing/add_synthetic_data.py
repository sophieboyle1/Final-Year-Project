import pandas as pd
import numpy as np

# Load the merged dataset
file_path = "nhs_ae_merged_with_synthetic_july_2021.csv"
nhs_all = pd.read_csv(file_path)

# Ensure 'year' is treated as a string to avoid mismatches
nhs_all["year"] = nhs_all["year"].astype(str)

### Generate Synthetic July 2021 Data
# Extract July data from multiple previous years for better accuracy
july_data = nhs_all[(nhs_all["month"] == "July") & (nhs_all["year"].isin(["2024", "2023", "2022", "2020", "2019"]))]

# Compute mean and standard deviation for numerical columns
numeric_cols = july_data.select_dtypes(include=[np.number]).columns
july_mean = july_data[numeric_cols].mean()
july_std = july_data[numeric_cols].std()

# Generate synthetic July 2021 data using mean and small random variation
num_samples = len(july_data) // 5  # Approximate size based on multiple years
synthetic_july_2021 = pd.DataFrame()

for col in numeric_cols:
    synthetic_july_2021[col] = np.random.normal(july_mean[col], july_std[col] * 0.1, num_samples)  # Small variance

# Assign fixed values for categorical columns
synthetic_july_2021["month"] = "July"
synthetic_july_2021["year"] = "2021"  # Ensure this is a string
synthetic_july_2021["org_code"] = np.random.choice(july_data["org_code"].dropna().unique(), num_samples)
synthetic_july_2021["parent_org"] = np.random.choice(july_data["parent_org"].dropna().unique(), num_samples)
synthetic_july_2021["org_name"] = np.random.choice(july_data["org_name"].dropna().unique(), num_samples)

# Append synthetic July 2021 data to the dataset
nhs_all = pd.concat([nhs_all, synthetic_july_2021], ignore_index=True)


### 🔹 Generate Synthetic Data for Missing 2018 Months (January, February, March)
# Define missing months
missing_months = ["January", "February", "March"]
missing_year = "2018"

# Extract data from multiple past years for better accuracy (2021, 2020, 2019)
reference_data = nhs_all[(nhs_all["month"].isin(missing_months)) & (nhs_all["year"].isin(["2021", "2020", "2019"]))]

# Compute mean and standard deviation for numerical columns
mean_values = reference_data[numeric_cols].mean()
std_values = reference_data[numeric_cols].std()

# Generate synthetic data
synthetic_2018 = pd.DataFrame()

for month in missing_months:
    num_samples = len(reference_data[reference_data["month"] == month]) // 3  # Approximate size
    
    temp_df = pd.DataFrame()
    
    for col in numeric_cols:
        temp_df[col] = np.random.normal(mean_values[col], std_values[col] * 0.1, num_samples)  # Small variance

    # Assign fixed values for categorical columns
    temp_df["month"] = month
    temp_df["year"] = missing_year
    temp_df["org_code"] = np.random.choice(reference_data["org_code"].dropna().unique(), num_samples)
    temp_df["parent_org"] = np.random.choice(reference_data["parent_org"].dropna().unique(), num_samples)
    temp_df["org_name"] = np.random.choice(reference_data["org_name"].dropna().unique(), num_samples)

    synthetic_2018 = pd.concat([synthetic_2018, temp_df], ignore_index=True)

# Append synthetic 2018 data to the dataset
nhs_all = pd.concat([nhs_all, synthetic_2018], ignore_index=True)


### 🔹 Save Updated Dataset with All Synthetic Data
final_file_path = "nhs_ae_merged_with_synthetic_data.csv"
nhs_all.to_csv(final_file_path, index=False)

print("\n✅ Synthetic July 2021 and Missing 2018 Data Successfully Added.")
print(f"📁 Updated dataset saved as {final_file_path}")

# Verify that synthetic data exists
print("\n🔍 Verifying synthetic data...")

# Check if July 2021 exists
print("Count of July 2021 records:", nhs_all[(nhs_all["month"] == "July") & (nhs_all["year"] == "2021")].shape[0])

# Check if January, February, and March 2018 exist
for month in missing_months:
    print(f"Count of {month} 2018 records:", nhs_all[(nhs_all['month'] == month) & (nhs_all['year'] == '2018')].shape[0])

# Display a sample of the synthetic data
print("\n🔍 Sample of Synthetic Data:")
print(nhs_all[(nhs_all["year"] == "2021") & (nhs_all["month"] == "July")].head())
print(nhs_all[(nhs_all["year"] == "2018") & (nhs_all["month"].isin(missing_months))].head())
