import os
import pandas as pd
import io
import re
import matplotlib.pyplot as plt
import seaborn as sns
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Azure Storage Account details
AZURE_CONNECTION_STRING = os.getenv("AZURE_CONNECTION_STRING")
AZURE_CONTAINER_NAME = os.getenv("AZURE_CONTAINER_NAME")

# Ensure Azure Connection
if not AZURE_CONNECTION_STRING:
    raise RuntimeError("Azure Connection String is missing. Check your .env file.")

try:
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
    container_client = blob_service_client.get_container_client(AZURE_CONTAINER_NAME)
    print("✅ Connected to Azure Blob Storage")
except Exception as e:
    raise RuntimeError(f"❌ Failed to connect to Azure: {e}")

# Function to extract month from filename
def extract_month_from_filename(filename):
    """Extract the month from the filename, assuming format: Monthly_AE_<Month>_<Year>.csv"""
    match = re.search(r'Monthly_AE_([A-Za-z]+)_\d{4}\.csv', filename)
    return match.group(1) if match else None

# Function to fetch and clean NHS A&E data for a given year
def load_nhs_data(year):
    """Fetch NHS A&E data for a given year from Azure Blob Storage and clean it."""
    print(f"\nFetching data for {year}...")

    # Identify files containing the specified year
    year_files = [blob.name for blob in container_client.list_blobs() if f"{year}" in blob.name and ".csv" in blob.name]

    if not year_files:
        print(f"⚠ No files found for {year}.")
        return None

    dfs = []
    for blob_name in year_files:
        blob_client = container_client.get_blob_client(blob_name)

        try:
            # Read file content
            blob_data = blob_client.download_blob().readall()
            csv_stream = io.StringIO(blob_data.decode("utf-8"))

            # Read dataset
            df = pd.read_csv(csv_stream, low_memory=False)
            df = df.loc[:, ~df.columns.str.contains('Unnamed', case=False)]  # Remove unnamed columns
            df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")  # Clean column names
            df['month'] = extract_month_from_filename(blob_name)  # Extract month
            df['year'] = int(year)  # Convert year to integer
            dfs.append(df)

        except Exception as e:
            print(f"❌ Error reading {blob_name}: {e}")

    # Combine all files for the year
    if dfs:
        nhs_data = pd.concat(dfs, ignore_index=True)
        print(f"✅ Loaded {len(dfs)} files for {year}. Shape: {nhs_data.shape}")

        # Remove columns with more than 90% missing values
        missing_percentage = nhs_data.isnull().sum() / len(nhs_data) * 100
        columns_to_drop = missing_percentage[missing_percentage > 90].index
        nhs_data.drop(columns=columns_to_drop, inplace=True)

        # Fill remaining missing values with 0
        nhs_data.fillna(0, inplace=True)

        # Add percentage seen within 4 hours
        if "percentage_seen_within_4_hours" not in nhs_data.columns:
            nhs_data = nhs_data.assign(
                percentage_seen_within_4_hours=(
                    (nhs_data.get("a&e_attendances_type_1", 0) - nhs_data.get("attendances_over_4hrs_type_1", 0)) /
                    nhs_data.get("a&e_attendances_type_1", 1)  # Avoid division by zero
                ) * 100
            )
            nhs_data["percentage_seen_within_4_hours"] = nhs_data["percentage_seen_within_4_hours"].clip(0, 100)

        return nhs_data
    else:
        return None

# Load 2024 and 2023 data
# Load 2024, 2023, and now 2022 data
nhs_2024 = load_nhs_data("2024")
nhs_2023 = load_nhs_data("2023")
nhs_2022 = load_nhs_data("2022") 

# Combine all available years
dfs = [df for df in [nhs_2024, nhs_2023, nhs_2022] if df is not None]

if dfs:
    nhs_all = pd.concat(dfs, ignore_index=True)
    print(f"✅ Merged {len(dfs)} years of data. Shape: {nhs_all.shape}")
else:
    raise RuntimeError("❌ No data available for analysis.")

# Convert 'year' to a categorical variable for easier visualization
nhs_all["year"] = nhs_all["year"].astype(str)

# Save the final merged dataset after combining all years
nhs_all.to_csv("nhs_ae_merged.csv", index=False)
print("\n📁 Merged dataset saved as nhs_ae_merged.csv")

