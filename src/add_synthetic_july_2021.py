import pandas as pd
import numpy as np

# Load the merged dataset
file_path = "nhs_ae_merged_with_synthetic_july_2021.csv"
nhs_all = pd.read_csv(file_path)

# Ensure 'year' is treated as a string to avoid mismatches
nhs_all["year"] = nhs_all["year"].astype(str)

# Extract July data from previous years (2024, 2023, 2022)
july_data = nhs_all[(nhs_all["month"] == "July") & (nhs_all["year"].isin(["2024", "2023", "2022"]))]

# Compute mean and standard deviation for numerical columns
numeric_cols = july_data.select_dtypes(include=[np.number]).columns
july_mean = july_data[numeric_cols].mean()
july_std = july_data[numeric_cols].std()

# Generate synthetic July 2021 data using mean and small random variation
num_samples = len(july_data) // 3  # Approximate size based on other years
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

# Save updated dataset
final_file_path = "nhs_ae_merged_with_synthetic_july_2021.csv"
nhs_all.to_csv(final_file_path, index=False)

print("\n✅ Synthetic July 2021 data successfully added.")
print(f"📁 Updated dataset saved as {final_file_path}")

# Verify that July 2021 exists now
print("\n🔍 Verifying synthetic data...")
print("Unique years in dataset:", nhs_all["year"].unique())
print("Count of July 2021 records:", nhs_all[(nhs_all["month"] == "July") & (nhs_all["year"] == "2021")].shape[0])
print(nhs_all[(nhs_all["month"] == "July") & (nhs_all["year"] == "2021")].head())
