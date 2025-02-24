import os
import pandas as pd
import io
import chardet
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Azure Storage Configuration
AZURE_CONNECTION_STRING = os.getenv("AZURE_CONNECTION_STRING")
AZURE_CONTAINER_NAME = os.getenv("AZURE_CONTAINER_NAME")
CLEANED_DATASET_BLOB = "cleaned_nhs_ae_data.parquet"

if not AZURE_CONNECTION_STRING:
    raise RuntimeError("Azure Connection String is missing! Check your .env file.")

# Initialize Azure Blob Service Client
try:
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
    container_client = blob_service_client.get_container_client(AZURE_CONTAINER_NAME)
    print("✅ Connected to Azure Blob Storage!")
except Exception as e:
    raise RuntimeError(f"❌ Failed to connect to Azure: {e}")

# Files to exclude due to previous issues
EXCLUDED_FILES = ["Monthly_AE_July_2021.csv"]

# Function to detect encoding dynamically
def detect_encoding(blob_client):
    raw_data = blob_client.download_blob().readall()
    result = chardet.detect(raw_data)
    return result["encoding"]

# Function to fix duplicate column names
def deduplicate_columns(columns):
    seen = {}
    new_columns = []
    for col in columns:
        if col in seen:
            seen[col] += 1
            new_col = f"{col}_{seen[col]}"
        else:
            seen[col] = 0
            new_col = col
        new_columns.append(new_col)
    return new_columns

# Function to extract the "Period" from metadata rows
def extract_period(blob_client):
    raw_data = blob_client.download_blob().readall().decode(errors="replace")
    for line in raw_data.split("\n"):
        if "Period:" in line:
            return line.split(",")[1].strip()  # Extract the second column value
    return None  # If no period is found

# Function to load NHS A&E Data from Azure
def load_nhs_data():
    print("Fetching NHS A&E data from Azure Blob Storage...")

    blob_list = [
        blob.name for blob in container_client.list_blobs()
        if blob.name.endswith('.csv') and blob.name not in EXCLUDED_FILES
    ]

    dfs = []
    for blob_name in blob_list:
        print(f"Loading {blob_name}...")

        blob_client = container_client.get_blob_client(blob_name)

        try:
            # Detect encoding
            encoding = detect_encoding(blob_client)
            print(f"📜 Detected Encoding for {blob_name}: {encoding}")

            # Extract the "Period" value
            period_value = extract_period(blob_client)
            print(f"Extracted Period: {period_value}")

            # Read CSV, skipping metadata rows (adjust skiprows if needed)
            csv_content = blob_client.download_blob().readall()
            csv_stream = io.StringIO(csv_content.decode(encoding, errors="replace"))

            df = pd.read_csv(csv_stream, encoding=encoding, skiprows=10, low_memory=False)  # Adjust skiprows as needed

            # Add extracted period to dataset
            df["period"] = period_value

            # Standardize column names BEFORE deduplication
            df.columns = (
                df.columns
                .str.encode('ascii', 'ignore').str.decode('ascii')  # Remove non-ASCII characters
                .str.strip().str.lower().str.replace(" ", "_")  # Lowercase, remove spaces
            )

            # Deduplicate column names
            df.columns = deduplicate_columns(df.columns)

            dfs.append(df)

        except Exception as e:
            print(f"❌ Error reading {blob_name}: {e}")

    if not dfs:
        raise RuntimeError("❌ No valid files were loaded from Azure!")

    nhs_data = pd.concat(dfs, ignore_index=True)
    print(f"Data loaded! Shape: {nhs_data.shape}")

    # Drop unwanted columns
    unnamed_cols = [col for col in nhs_data.columns if "unnamed" in col.lower()]
    nhs_data.drop(columns=unnamed_cols, inplace=True, errors="ignore")
    print(f"🗑️ Dropped columns: {unnamed_cols}")

    # Final check for duplicate columns
    duplicate_columns = nhs_data.columns[nhs_data.columns.duplicated()].tolist()
    if duplicate_columns:
        print(f"⚠️ Warning: Final duplicate columns detected: {duplicate_columns}")
        nhs_data = nhs_data.loc[:, ~nhs_data.columns.duplicated()]  # Drop duplicate columns

    # Save cleaned data **locally**
    nhs_data.to_parquet("cleaned_nhs_ae_data.parquet", engine="pyarrow")
    nhs_data.to_csv("cleaned_nhs_ae_data.csv", index=False)
    print("Cleaned data saved locally as 'cleaned_nhs_ae_data.parquet' and 'cleaned_nhs_ae_data.csv'")

    # Save cleaned data **to Azure**
    buffer = io.BytesIO()
    nhs_data.to_parquet(buffer, engine="pyarrow")
    buffer.seek(0)

    blob_client = container_client.get_blob_client(CLEANED_DATASET_BLOB)
    blob_client.upload_blob(buffer, blob_type="BlockBlob", overwrite=True)
    print(f"Cleaned data saved to Azure as {CLEANED_DATASET_BLOB}!")

    return nhs_data


# Run the script
if __name__ == "__main__":
    nhs_data = load_nhs_data()
    print("Data is ready for analysis!")