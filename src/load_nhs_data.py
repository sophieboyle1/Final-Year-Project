import os
import pandas as pd
from azure.storage.blob import BlobServiceClient
from dotenv import load_dotenv
import io

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
    raise RuntimeError(f"❌ Azure Blob Container '{AZURE_CONTAINER_NAME}' not found!")

# ❌ **Exclude problematic 2017-18 files**
EXCLUDED_FILES = [
    "Monthly_AE_April_2017.csv", "Monthly_AE_December_2017.csv",
    "Monthly_AE_February_2018.csv", "Monthly_AE_January_2018.csv",
    "Monthly_AE_July_2017.csv", "Monthly_AE_June_2017.csv",
    "Monthly_AE_March_2018.csv", "Monthly_AE_May_2017.csv",
    "Monthly_AE_November_2017.csv", "Monthly_AE_October_2017.csv",
    "Monthly_AE_September_2017.csv"
]

# ✅ Function to load NHS A&E CSV files from Azure Blob Storage
def load_nhs_data_from_azure():
    """Fetch all valid NHS A&E CSV files from Azure Blob Storage."""
    print("🚀 Fetching NHS A&E data from Azure Blob Storage...")

    # Get all CSV files in the container
    blob_list = [blob.name for blob in container_client.list_blobs() if blob.name.endswith('.csv')]

    dfs = []
    for blob_name in blob_list:
        # Skip excluded files
        if blob_name in EXCLUDED_FILES:
            print(f"⏭️ Skipping {blob_name} (excluded year)")
            continue

        print(f"📥 Loading {blob_name}...")

        # Download file as a stream
        blob_client = container_client.get_blob_client(blob_name)

        try:
            # ✅ Try reading with ISO-8859-1 encoding to avoid Unicode errors
            csv_content = blob_client.download_blob().content_as_text(encoding="ISO-8859-1")
            csv_stream = io.StringIO(csv_content)

            # ✅ Read CSV into DataFrame
            df = pd.read_csv(csv_stream, encoding="ISO-8859-1", low_memory=False)
            dfs.append(df)
        except UnicodeDecodeError as e:
            print(f"❌ Unicode error reading {blob_name}: {e}")
        except Exception as e:
            print(f"❌ Failed to read {blob_name}: {e}")

    # ✅ Combine all CSVs into a single DataFrame
    if dfs:
        nhs_data = pd.concat(dfs, ignore_index=True)
        print(f"✅ NHS A&E Data loaded successfully! Shape: {nhs_data.shape}")

        # ✅ **Data Cleaning Section**
        print("🧹 Cleaning the dataset...")

        # Debugging: Check initial data info
        print("\n🛠 Initial Data Info:")
        print(nhs_data.info())

        # **1️⃣ Fix column names (remove encoding issues)**
        nhs_data.columns = (
            nhs_data.columns
            .str.encode('ascii', 'ignore').str.decode('ascii')  # Remove non-ASCII characters
            .str.strip().str.lower().str.replace(" ", "_")  # Standardize formatting
        )

        # Debugging: Check column names after fixing
        print("\n🛠 Column Names After Fixing:")
        print(nhs_data.columns)

        # **2️⃣ Drop empty or corrupted columns**
        cols_to_drop = [col for col in nhs_data.columns if "unnamed" in col or nhs_data[col].nunique() <= 1]
        nhs_data.drop(columns=cols_to_drop, inplace=True)
        print(f"🗑️ Dropped columns: {cols_to_drop}")

        # Debugging: Check data info after dropping columns
        print("\n🛠 Data Info After Dropping Columns:")
        print(nhs_data.info())

        # **3️⃣ Convert numeric columns properly**
        numeric_cols = ['total_attendances', 'waiting_time', 'emergency_admissions']
        for col in numeric_cols:
            if col in nhs_data.columns:
                nhs_data[col] = pd.to_numeric(nhs_data[col], errors='coerce')

        # Debugging: Check data types after conversion
        print("\n🛠 Data Types After Conversion:")
        print(nhs_data.dtypes)

        # **4️⃣ Handle missing waiting times**
        if 'waiting_time' in nhs_data.columns:
            if not nhs_data['waiting_time'].empty:
                nhs_data['waiting_time'].fillna(nhs_data['waiting_time'].median(), inplace=True)

        # Debugging: Check data after handling missing waiting times
        print("\n🛠 Data After Handling Missing Waiting Times:")
        print(nhs_data.head())

        # **5️⃣ Fill remaining missing values with 0**
        nhs_data.fillna(0, inplace=True)

        # **6️⃣ Remove duplicates**
        if not nhs_data.empty:
            nhs_data.drop_duplicates(inplace=True)

        # Debugging: Final check of cleaned data
        print("\n🛠 Final Cleaned Data Info:")
        print(nhs_data.info())

        print("✅ Data cleaning complete!")
        return nhs_data
    else:
        raise RuntimeError("❌ No valid files were loaded from Azure!")

# ✅ Run the script
if __name__ == "__main__":
    try:
        nhs_data = load_nhs_data_from_azure()
        print("🎉 Data is ready for use!")
    except Exception as e:
        print(f"❌ Error loading data: {e}")
