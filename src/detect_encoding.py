import chardet
import io
import os
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Azure Storage Account details
AZURE_CONNECTION_STRING = os.getenv("AZURE_CONNECTION_STRING")
AZURE_CONTAINER_NAME = os.getenv("AZURE_CONTAINER_NAME")

# Ensure Azure Connection
if not AZURE_CONNECTION_STRING:
    raise RuntimeError("❌ Azure Connection String is missing. Check your .env file.")

try:
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
    container_client = blob_service_client.get_container_client(AZURE_CONTAINER_NAME)
    print("✅ Connected to Azure Blob Storage")
except Exception as e:
    raise RuntimeError(f"❌ Failed to connect to Azure: {e}")

# Specify the file in Azure
blob_name = "Monthly_AE_July_2021.csv"

# Fetch the file from Azure Blob Storage
try:
    blob_client = container_client.get_blob_client(blob_name)
    blob_data = blob_client.download_blob().readall()

    # Detect encoding using chardet
    result = chardet.detect(blob_data[:10000])  # Read first 10,000 bytes
    detected_encoding = result["encoding"]
    print(f"🔍 Detected Encoding: {detected_encoding}")

except Exception as e:
    print(f"❌ Error reading {blob_name}: {e}")
