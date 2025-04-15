from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Azure Storage details
AZURE_STORAGE_ACCOUNT_NAME = os.getenv("AZURE_STORAGE_ACCOUNT_NAME")
AZURE_STORAGE_ACCOUNT_KEY = os.getenv("AZURE_STORAGE_ACCOUNT_KEY")
AZURE_CONTAINER_NAME = os.getenv("AZURE_CONTAINER_NAME")

# Initialize BlobServiceClient
blob_service_client = BlobServiceClient(
    f"https://{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net",
    credential=AZURE_STORAGE_ACCOUNT_KEY
)

# Get container client
container_client = blob_service_client.get_container_client(AZURE_CONTAINER_NAME)

# List all blobs and delete them
blobs = container_client.list_blobs()
for blob in blobs:
    container_client.delete_blob(blob.name)
    print(f"🗑️ Deleted: {blob.name}")

print("✅ All blobs deleted successfully!")
