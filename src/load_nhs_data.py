import os
import pandas as pd
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Azure Storage Account details from .env
AZURE_STORAGE_ACCOUNT_NAME = os.getenv("AZURE_STORAGE_ACCOUNT_NAME")
AZURE_STORAGE_ACCOUNT_KEY = os.getenv("AZURE_STORAGE_ACCOUNT_KEY")
AZURE_CONTAINER_NAME = os.getenv("AZURE_CONTAINER_NAME")

# Connect to Azure Blob Storage
blob_service_client = BlobServiceClient(
    f"https://{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net",
    credential=AZURE_STORAGE_ACCOUNT_KEY
)
container_client = blob_service_client.get_container_client(AZURE_CONTAINER_NAME)

# List all available files
blobs = container_client.list_blobs()
file_list = [blob.name for blob in blobs]
print("\n📂 Files in Azure Blob Storage:")
for file in file_list:
    print(f"   - {file}")

# Select a specific file (e.g., January 2024)
blob_name = "Monthly_AE_January_2024.csv"  # Change this dynamically if needed
blob_client = container_client.get_blob_client(blob_name)

# Download the file
with open(blob_name, "wb") as f:
    f.write(blob_client.download_blob().readall())
print(f"\n✅ Downloaded: {blob_name}")

# Load into Pandas DataFrame
df = pd.read_csv(blob_name)
print("\n📊 Sample Data Preview:")
print(df.head())
