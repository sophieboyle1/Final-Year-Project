import os
import pandas as pd
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Azure Storage Account details
AZURE_STORAGE_ACCOUNT_NAME = os.getenv("AZURE_STORAGE_ACCOUNT_NAME")
AZURE_STORAGE_ACCOUNT_KEY = os.getenv("AZURE_STORAGE_ACCOUNT_KEY")
AZURE_CONTAINER_NAME = os.getenv("AZURE_CONTAINER_NAME")

# Initialize Azure Blob Service Client
blob_service_client = BlobServiceClient(
    f"https://{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net",
    credential=AZURE_STORAGE_ACCOUNT_KEY
)

# Get container client
container_client = blob_service_client.get_container_client(AZURE_CONTAINER_NAME)

# Get list of all blob files in the container
blob_list = container_client.list_blobs()

# Create an empty DataFrame to store all data
combined_df = pd.DataFrame()

# Loop through each file in Azure Blob Storage and load into Pandas
for blob in blob_list:
    blob_name = blob.name  # Extract file name
    print(f"📂 Loading file: {blob_name}")

    # Download the blob as a stream
    blob_client = container_client.get_blob_client(blob_name)
    stream = blob_client.download_blob().readall()

    # Read CSV into a Pandas DataFrame
    df = pd.read_csv(pd.io.common.BytesIO(stream))

    # Append to combined DataFrame
    combined_df = pd.concat([combined_df, df], ignore_index=True)

# Save the combined dataset (Optional: for local caching)
combined_df.to_csv("combined_nhs_ae_data.csv", index=False)

# Print summary
print("All NHS A&E data loaded successfully!")
print(combined_df.head())
