import requests
import pandas as pd
from bs4 import BeautifulSoup
import os

# URL of the HSE data page 
url = "https://uec.hse.ie/uec/TGAR.php?EDDATE=21%2F10%2F2024"

# Make a request to the webpage
response = requests.get(url)

# Check if the request was successful (status code 200 means success)
if response.status_code == 200:
    # Parse the HTML content using BeautifulSoup
    soup = BeautifulSoup(response.text, 'html.parser')

    # Use pandas to find and read HTML tables from the parsed page
    tables = pd.read_html(str(soup))

    # Check if tables were found
    if len(tables) > 0:
        # Select the first table (if there are multiple tables on the page)
        data = tables[0]

        # Display the first few rows of the scraped data
        print("Scraped data preview:")
        print(data.head())

        # Ensure the data directory exists
        data_dir = os.path.join(os.path.dirname(__file__), '../data/')
        os.makedirs(os.path.abspath(data_dir), exist_ok=True)

        # Save the scraped data to a CSV file
        data.to_csv(os.path.join(data_dir, 'hse_scraped_data.csv'), index=False)
        print(f"Data saved to '{data_dir}'")
    else:
        print("No tables found on the webpage.")
else:
    print(f"Failed to retrieve the webpage. Status code: {response.status_code}")
