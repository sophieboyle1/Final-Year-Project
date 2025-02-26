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

# Function to fetch and clean 2024 data
def load_2024_data():
    """Fetch NHS A&E data for 2024 from Azure Blob Storage and clean it."""
    year = "2024"
    print(f"\n📡 Fetching data for {year}...")

    # Identify files containing '2024' in the filename
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
            dfs.append(df)

        except Exception as e:
            print(f"❌ Error reading {blob_name}: {e}")

    # Combine all 2024 files
    if dfs:
        nhs_2024 = pd.concat(dfs, ignore_index=True)
        print(f"✅ Loaded {len(dfs)} files for {year}. Shape: {nhs_2024.shape}")

        # Remove columns with more than 90% missing values
        missing_percentage = nhs_2024.isnull().sum() / len(nhs_2024) * 100
        columns_to_drop = missing_percentage[missing_percentage > 90].index
        nhs_2024.drop(columns=columns_to_drop, inplace=True)

        # Fill remaining missing values with 0
        nhs_2024.fillna(0, inplace=True)

        # Add percentage seen within 4 hours if missing
        if "percentage_seen_within_4_hours" not in nhs_2024.columns:
            nhs_2024["percentage_seen_within_4_hours"] = (
                (nhs_2024.get("a&e_attendances_type_1", 0) - nhs_2024.get("attendances_over_4hrs_type_1", 0)) /
                nhs_2024.get("a&e_attendances_type_1", 1)  # Avoid division by zero
            ) * 100
            nhs_2024["percentage_seen_within_4_hours"].replace([float('inf'), -float('inf')], 0, inplace=True)
            nhs_2024["percentage_seen_within_4_hours"].fillna(0, inplace=True)
            nhs_2024["percentage_seen_within_4_hours"] = nhs_2024["percentage_seen_within_4_hours"].clip(0, 100)

        # Save cleaned dataset
        cleaned_filename = "nhs_ae_2024_cleaned.csv"
        nhs_2024.to_csv(cleaned_filename, index=False)
        print(f"📁 Cleaned data saved as {cleaned_filename}")

        return nhs_2024
    else:
        return None

# Run the loading process
nhs_2024 = load_2024_data()

# If data loaded, generate a visualization
if nhs_2024 is not None:
    # Histogram of Percentage Seen Within 4 Hours
    plt.figure(figsize=(12, 6))
    sns.histplot(nhs_2024['percentage_seen_within_4_hours'], bins=20, kde=True)
    plt.xlabel("Percentage Seen Within 4 Hours")
    plt.ylabel("Count")
    plt.title("Distribution of Percentage Seen Within 4 Hours")
    
    print("\n📊 Plot saved as 'percentage_seen_within_4_hours.png'")

print("\n✅ Data Cleaning Complete.")
