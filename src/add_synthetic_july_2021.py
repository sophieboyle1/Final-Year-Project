import pandas as pd
import numpy as np

# Load the merged dataset
file_path = "nhs_ae_merged.csv"
nhs_all = pd.read_csv(file_path)

# Check if July 2021 is missing
if not ((nhs_all["month"] == "July") & (nhs_all["year"] == "2021")).any():
    print("🛠 Generating synthetic data for missing July 2021...")

    # Extract July data from previous years (2024, 2023, 2022)
    july_data = nhs_all[(nhs_all["month"] == "July") & (nhs_all["year"].isin(["2024", "2023", "2022"]))]

    # Compute mean and standard deviation for numerical columns
    numeric_cols = july_data.select_dtypes(include=[np.number]).columns
    july_mean = july_data[numeric_cols].mean()
    july_std = july_data[numeric_cols].std()

    # Generate synthetic July 2021 data using mean and small random variation
    num_samples = july_data.shape[0]  # Match previous years' size
    synthetic_july_2021 = pd.DataFrame()

    for col in numeric_cols:
        synthetic_july_2021[col] = np.abs(np.random.normal(july_mean[col], july_std[col] * 0.1, num_samples))  # Prevent negatives

    # Assign categorical columns based on existing distributions
    synthetic_july_2021["month"] = "July"
    synthetic_july_2021["year"] = "2021"
    synthetic_july_2021["org_code"] = np.random.choice(july_data["org_code"].dropna().unique(), num_samples)
    synthetic_july_2021["parent_org"] = np.random.choice(july_data["parent_org"].dropna().unique(), num_samples)
    synthetic_july_2021["org_name"] = np.random.choice(july_data["org_name"].dropna().unique(), num_samples)

    # Append synthetic July 2021 data to the dataset
    nhs_all = pd.concat([nhs_all, synthetic_july_2021], ignore_index=True)
    print(f"✅ Synthetic July 2021 data added. New shape: {nhs_all.shape}")

    # Save updated dataset
    final_file_path = "nhs_ae_merged_with_synthetic_july_2021.csv"
    nhs_all.to_csv(final_file_path, index=False)
    print("\n📁 Updated dataset saved as nhs_ae_merged_with_synthetic_july_2021.csv")
else:
    print("✅ July 2021 already exists in the dataset. No synthetic data added.")
