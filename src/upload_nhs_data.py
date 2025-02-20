import os
import requests
from bs4 import BeautifulSoup
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv
import re  # Import regex to clean filenames

# Load environment variables
load_dotenv()

# Azure Storage Account details from .env
AZURE_STORAGE_ACCOUNT_NAME = os.getenv("AZURE_STORAGE_ACCOUNT_NAME")
AZURE_STORAGE_ACCOUNT_KEY = os.getenv("AZURE_STORAGE_ACCOUNT_KEY")
AZURE_CONTAINER_NAME = os.getenv("AZURE_CONTAINER_NAME")

# Base NHS URL pattern for multiple years
BASE_URL_TEMPLATE = "https://www.england.nhs.uk/statistics/statistical-work-areas/ae-waiting-times-and-activity/ae-attendances-and-emergency-admissions-{}-{}/"

# Define the range of years to scrape (from 2016-17 to 2024-25)
YEARS_TO_SCRAPE = [(year, year + 1) for year in range(2016, 2025)]

# Initialize Azure Blob Service Client
blob_service_client = BlobServiceClient(
    f"https://{AZURE_STORAGE_ACCOUNT_NAME}.blob.core.windows.net",
    credential=AZURE_STORAGE_ACCOUNT_KEY
)

# Ensure Azure Blob Container exists
try:
    container_client = blob_service_client.get_container_client(AZURE_CONTAINER_NAME)
    container_client.get_container_properties()
except Exception:
    container_client = blob_service_client.create_container(AZURE_CONTAINER_NAME)


# Function to scrape NHS Monthly A&E CSV file links from multiple years
def get_all_yearly_ae_links():
    """Scrape NHS website for multiple years and return Monthly A&E CSV file links."""
    all_files = {}

    for year_start, year_end in YEARS_TO_SCRAPE:
        url = BASE_URL_TEMPLATE.format(year_start, str(year_end)[-2:])  # Format URL correctly
        print(f"🔍 Scraping {year_start}-{year_end} data from: {url}")

        try:
            response = requests.get(url)
            if response.status_code != 200:
                print(f"⚠️ Could not access {url} (Status Code: {response.status_code})")
                continue

            soup = BeautifulSoup(response.text, 'html.parser')
            monthly_files = {}

            for link in soup.find_all('a', href=True):
                href = link['href']
                text = link.get_text(strip=True)

                # ✅ Extract month and ensure it's a valid Monthly A&E file
                match = re.search(r"Monthly A&E (\w+) (\d{4})", text)
                if match and (href.endswith('.csv') or href.endswith('.xls') or href.endswith('.xlsx')):
                    month_name = match.group(1)  # Extract Month
                    file_year = match.group(2)   # Extract Year

                    # Ensure only one per month per year
                    if month_name not in monthly_files:
                        monthly_files[f"{month_name}_{file_year}"] = href if href.startswith("http") else url + href

            all_files.update(monthly_files)

        except Exception as e:
            print(f"❌ Error processing {url}: {e}")

    return all_files


# Function to download and upload files to Azure
def download_and_upload_files():
    """Download NHS A&E files and upload to Azure."""
    file_links = get_all_yearly_ae_links()

    for month_year, file_url in file_links.items():
        # ✅ Properly format the filename (Month_Year)
        file_name = f"Monthly_AE_{month_year}.csv"  

        try:
            response = requests.get(file_url, stream=True)
            if response.status_code == 200:
                with open(file_name, "wb") as file:
                    for chunk in response.iter_content(chunk_size=1024):
                        file.write(chunk)
                print(f"✅ Downloaded: {file_name}")

                # Upload to Azure Blob Storage
                blob_client = blob_service_client.get_blob_client(AZURE_CONTAINER_NAME, file_name)
                with open(file_name, "rb") as data:
                    blob_client.upload_blob(data, overwrite=True)
                print(f"🚀 Uploaded to Azure: {file_name}")

                # Remove local file after successful upload
                os.remove(file_name)
            else:
                print(f"❌ Failed to download: {file_url} (Status Code: {response.status_code})")

        except Exception as e:
            print(f"⚠️ Error processing {file_name}: {e}")


# Run the script
if __name__ == "__main__":
    print("🔍 Fetching NHS A&E Data for multiple years...")
    download_and_upload_files()
    print("✅ All NHS A&E files processed successfully!")
