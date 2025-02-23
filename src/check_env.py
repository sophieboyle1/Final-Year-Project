import os
from dotenv import load_dotenv

load_dotenv()  # Load environment variables

print("AZURE_CONNECTION_STRING:", os.getenv("AZURE_CONNECTION_STRING"))
print("AZURE_CONTAINER_NAME:", os.getenv("AZURE_CONTAINER_NAME"))
