import os
import requests
from bs4 import BeautifulSoup
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv
import re  # Import regex to clean filenames

# ✅ Load environment variables
load_dotenv()

# ✅ Azure Storage Account details from .env
AZURE_CONNECTION_STRING = os.getenv("AZURE_CONNECTION_STRING")
AZURE_CONTAINER_NAME = os.getenv("AZURE_CONTAINER_NAME")

# ✅ Ensure the Azure connection string is correct
if not AZURE_CONNECTION_STRING or "AccountName" not in AZURE_CONNECTION_STRING:
    raise ValueError("❌ Azure Connection String is missing or malformed! Check your .env file.")

# ✅ Initialize Azure Blob Service Client
try:
    blob_service_client = BlobServiceClient.from_connection_string(AZURE_CONNECTION_STRING)
    print("✅ Successfully connected to Azure Blob Storage!")
except Exception as e:
    raise RuntimeError(f"❌ Failed to connect to Azure: {e}")

# ✅ Ensure Azure Blob Container exists
try:
    container_client = blob_service_client.get_container_client(AZURE_CONTAINER_NAME)
    container_client.get_container_properties()
    print(f"📂 Container '{AZURE_CONTAINER_NAME}' found!")
except Exception:
    container_client = blob_service_client.create_container(AZURE_CONTAINER_NAME)
    print(f"📂 Container '{AZURE_CONTAINER_NAME}' created!")

# ✅ Function to scrape NHS Monthly A&E CSV file links from multiple years
def get_ae_file_links():
    """Scrape NHS website and return Monthly A&E CSV file links."""
    BASE_URL = "https://www.england.nhs.uk/statistics/statistical-work-areas/ae-waiting-times-and-activity/"
    
    try:
        response = requests.get(BASE_URL)
        if response.status_code != 200:
            print(f"⚠️ Could not access {BASE_URL} (Status Code: {response.status_code})")
            return {}

        soup = BeautifulSoup(response.text, 'html.parser')
        files = {}

        for link in soup.find_all('a', href=True):
            href = link['href']
            text = link.get_text(strip=True)

            match = re.search(r"Monthly A&E (\w+) (\d{4})", text)
            if match and (href.endswith('.csv') or href.endswith('.xls') or href.endswith('.xlsx')):
                month_year = f"Monthly_AE_{match.group(1)}_{match.group(2)}.csv"
                files[month_year] = href if href.startswith("http") else BASE_URL + href

        return files

    except Exception as e:
        print(f"❌ Error scraping NHS website: {e}")
        return {}

# ✅ Function to download and upload files to Azure
def download_and_upload_files():
    """Download NHS A&E files and upload to Azure."""
    file_links = get_ae_file_links()

    for file_name, file_url in file_links.items():
        try:
            response = requests.get(file_url, stream=True)
            if response.status_code == 200:
                with open(file_name, "wb") as file:
                    for chunk in response.iter_content(chunk_size=1024):
                        file.write(chunk)
                print(f"✅ Downloaded: {file_name}")

                # ✅ Upload to Azure Blob Storage
                blob_client = blob_service_client.get_blob_client(AZURE_CONTAINER_NAME, file_name)
                with open(file_name, "rb") as data:
                    blob_client.upload_blob(data, overwrite=True)
                print(f"🚀 Uploaded to Azure: {file_name}")

                # ✅ Remove local file after successful upload
                os.remove(file_name)
            else:
                print(f"❌ Failed to download: {file_url} (Status Code: {response.status_code})")

        except Exception as e:
            print(f"⚠️ Error processing {file_name}: {e}")

# ✅ Run the script
if __name__ == "__main__":
    print("🚀 Starting NHS A&E Data Uploading Process...")
    download_and_upload_files()
    print("✅ All NHS A&E files uploaded to Azure!")
