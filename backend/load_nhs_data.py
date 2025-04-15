import os
import chardet
import pandas as pd
import io
import re
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv
import numpy as np

# Load environment variables
load_dotenv()

# Azure Storage Account details
AZURE_CONNECTION_STRING = os.getenv("AZURE_CONNECTION_STRING")
AZURE_CONTAINER_NAME = os.getenv("AZURE_CONTAINER_NAME")

if not AZURE_CONNECTION_STRING:
    raise RuntimeError("Azure Connection String is missing. Check your .env file.")

try:
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
    container_client = blob_service_client.get_container_client(AZURE_CONTAINER_NAME)
    print("✅ Connected to Azure Blob Storage")
except Exception as e:
    raise RuntimeError(f"❌ Failed to connect to Azure: {e}")

def extract_month_from_filename(filename):
    """Extracts the month from the filename, assuming format: Monthly_AE_<Month>_<Year>.csv"""
    match = re.search(r'Monthly_AE_([A-Za-z]+)_\d{4}\.csv', filename)
    return match.group(1) if match else None

def detect_encoding(blob_data):
    """Detects encoding of a file. Defaults to 'ISO-8859-1' if detection fails."""
    result = chardet.detect(blob_data)
    encoding = result['encoding']
    return encoding if encoding else "ISO-8859-1"

def load_nhs_data(year):
    """Fetches NHS A&E data for a given year from Azure Blob Storage and cleans it."""
    print(f"\n📡 Fetching data for {year}...")
    year_files = [blob.name for blob in container_client.list_blobs() if f"{year}" in blob.name and ".csv" in blob.name]

    if not year_files:
        print(f"⚠ No files found for {year}.")
        return None

    dfs = []
    for blob_name in year_files:
        if "July_2021" in blob_name:
            print(f"⚠ Processing {blob_name} (Fixing Known Issues)...")
        else:
            print(f"📂 Loading {blob_name}...")

        blob_client = container_client.get_blob_client(blob_name)

        try:
            blob_data = blob_client.download_blob().readall()
            encoding = detect_encoding(blob_data)
            csv_stream = io.StringIO(blob_data.decode(encoding, errors="replace"))
            df = pd.read_csv(csv_stream, low_memory=False)

            df = df.loc[:, ~df.columns.str.contains('Unnamed', case=False)]
            df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")
            df['month'] = extract_month_from_filename(blob_name)
            df['year'] = int(year)

            dfs.append(df)

        except Exception as e:
            print(f"❌ Error reading {blob_name}: {e}")

    if dfs:
        nhs_data = pd.concat(dfs, ignore_index=True)
        print(f"✅ Loaded {len(dfs)} files for {year}. Shape: {nhs_data.shape}")

        missing_percentage = nhs_data.isnull().sum() / len(nhs_data) * 100
        columns_to_drop = missing_percentage[missing_percentage > 90].index
        nhs_data.drop(columns=columns_to_drop, inplace=True)

        nhs_data.fillna(0, inplace=True)

        return nhs_data
    else:
        return None

years_to_load = ["2024", "2023", "2022", "2021", "2020"]
datasets = {year: load_nhs_data(year) for year in years_to_load}

dfs = [df for df in datasets.values() if df is not None]

if dfs:
    nhs_all = pd.concat(dfs, ignore_index=True)
    print(f"✅ Merged {len(dfs)} years of data. Shape: {nhs_all.shape}")
else:
    raise RuntimeError("❌ No data available for analysis.")

nhs_all["year"] = nhs_all["year"].astype(str)

# 🔍 **Ensure July 2021 Exists Before Saving**
if not ((nhs_all["year"] == "2021") & (nhs_all["month"] == "July")).any():
    print("⚠ July 2021 is missing! Adding a placeholder row for interpolation...")
    missing_july_2021 = pd.DataFrame({
        "year": ["2021"],
        "month": ["July"],
        "total_a&e_attendances": np.nan
    })
    nhs_all = pd.concat([nhs_all, missing_july_2021], ignore_index=True)

# ✅ **Interpolate July 2021 to Fill Missing Values**
nhs_all = nhs_all.sort_values(["year", "month"])
nhs_all["total_a&e_attendances"] = nhs_all["total_a&e_attendances"].interpolate()

# 📁 Save the Final Cleaned Dataset
final_file = "nhs_ae_merged.csv"
nhs_all.to_csv(final_file, index=False)
print(f"\n📁 Merged dataset saved as {final_file}")

# 🔍 Check July 2021 Values
july_2021_value = nhs_all[(nhs_all["year"] == "2021") & (nhs_all["month"] == "July")]["total_a&e_attendances"]
print(f"\n✅ July 2021 Attendance Value: {july_2021_value.values}")
