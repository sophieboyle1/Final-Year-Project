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
    print("Successfully connected to Azure Blob Storage.")
except Exception as e:
    raise RuntimeError(f"Failed to connect to Azure: {e}")

# Function to extract month from filename
def extract_month_from_filename(filename):
    """Extract the month from the filename, assuming format: Monthly_AE_<Month>_<Year>.csv"""
    match = re.search(r'Monthly_AE_([A-Za-z]+)_\d{4}\.csv', filename)
    return match.group(1) if match else None

# Function to fetch and clean 2024 data
def load_2024_data():
    """Fetch NHS A&E data for 2024 from Azure Blob Storage and clean it."""
    year = "2024"
    print(f"\nFetching data for {year}...")

    # Identify files containing '2024' in the filename
    year_files = [blob.name for blob in container_client.list_blobs() if f"{year}" in blob.name and ".csv" in blob.name]

    if not year_files:
        print(f"No files found for {year}.")
        return None

    dfs = []
    for blob_name in year_files:
        print(f"Loading {blob_name}...")
        blob_client = container_client.get_blob_client(blob_name)

        try:
            # Read file content
            blob_data = blob_client.download_blob().readall()
            csv_stream = io.StringIO(blob_data.decode("utf-8"))

            # Debugging: Print first 5 rows BEFORE processing
            df_sample = pd.read_csv(csv_stream, nrows=5)
            print(f"\nSample Data from {blob_name} (Before Processing):")
            print(df_sample)

            # Reload full dataset
            csv_stream.seek(0)  # Reset stream position
            df = pd.read_csv(csv_stream, low_memory=False)

            # Drop unnamed columns
            df = df.loc[:, ~df.columns.str.contains('Unnamed', case=False)]

            # Standardize column names
            df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")

            # Extract month from filename
            df['month'] = extract_month_from_filename(blob_name)

            # Append cleaned data
            dfs.append(df)
        except Exception as e:
            print(f"Failed to read {blob_name}: {e}")

    # Combine all 2024 files
    if dfs:
        nhs_2024 = pd.concat(dfs, ignore_index=True)
        print(f"Loaded {len(dfs)} files for {year}. Shape: {nhs_2024.shape}")

        # Remove columns with more than 90 percent missing values
        missing_percentage = nhs_2024.isnull().sum() / len(nhs_2024) * 100
        columns_to_drop = missing_percentage[missing_percentage > 90].index
        nhs_2024.drop(columns=columns_to_drop, inplace=True)
        print(f"Dropped {len(columns_to_drop)} columns with high missing values.")

        # Fill remaining missing values with 0
        nhs_2024.fillna(0, inplace=True)

        # Print month-by-month summary
        if 'month' in nhs_2024.columns:
            print("\nMonth-by-Month Data Summary:")
            for month in sorted(nhs_2024['month'].dropna().unique()):
                print(f"Month: {month} - {len(nhs_2024[nhs_2024['month'] == month])} records")
        else:
            print("\nMonth column is missing, skipping summary.")

        # Ensure the percentage column exists
        if 'percentage_seen_within_4_hours' in nhs_2024.columns:
            print("\nPercentage Seen Within 4 Hours is already in the dataset.")
        else:
            print("\nPercentage Seen Within 4 Hours is missing. Calculating now.")

            # Fix Zero Division Issues
            nhs_2024['percentage_seen_within_4_hours'] = (
                (nhs_2024['a&e_attendances_type_1'] - nhs_2024['attendances_over_4hrs_type_1']) /
                nhs_2024['a&e_attendances_type_1']
            ) * 100

            # Replace infinite and NaN values with 0
            nhs_2024['percentage_seen_within_4_hours'].replace([float('inf'), -float('inf')], 0, inplace=True)
            nhs_2024['percentage_seen_within_4_hours'].fillna(0, inplace=True)

            # Clip percentages to valid range 0 to 100
            nhs_2024['percentage_seen_within_4_hours'] = nhs_2024['percentage_seen_within_4_hours'].clip(0, 100)

            # Remove extremely low values that may be data errors
            nhs_2024 = nhs_2024[nhs_2024['percentage_seen_within_4_hours'] > 20]

            print("\nPercentage Seen Within 4 Hours has been successfully added.")

        # Save cleaned dataset
        cleaned_filename = "nhs_ae_2024_cleaned.csv"
        nhs_2024.to_csv(cleaned_filename, index=False)
        print(f"\nData saved as {cleaned_filename}.")

        return nhs_2024
    else:
        return None

# Run the loading process
nhs_2024 = load_2024_data()

# Print sample data for verification
if nhs_2024 is not None:
    print("\nSample Data for 2024 (After Cleaning):")
    print(nhs_2024.head())

    # Print final column names
    print("\nFinal Columns in 2024 Data:")
    print(nhs_2024.columns)

    # Print missing values summary
    print("\nMissing Values in 2024 Data (After Cleaning):")
    print(nhs_2024.isnull().sum())

    # Plot Percentage Seen Within 4 Hours
    plt.figure(figsize=(12, 6))
    sns.histplot(nhs_2024['percentage_seen_within_4_hours'], bins=20, kde=True)
    plt.xlabel("Percentage Seen Within 4 Hours")
    plt.ylabel("Count")
    plt.title("Distribution of Percentage Seen Within 4 Hours")
    plt.show()

print("\nData Cleaning Complete.")

print("\nUnique Month Values in Dataset:", nhs_2024['month'].unique())
