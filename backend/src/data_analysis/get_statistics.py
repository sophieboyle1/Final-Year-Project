import pandas as pd
import os

# Print current working directory
print(f"Current working directory: {os.getcwd()}")

# Go up to the main project directory
project_dir = os.path.abspath(os.path.join(os.getcwd(), "../../.."))
print(f"Project directory: {project_dir}")

# Function to find a file recursively
def find_file(filename, start_dir):
    for root, dirs, files in os.walk(start_dir):
        if filename in files:
            return os.path.join(root, filename)
    return None

# Files to search for
files_to_try = ["nhs_ae_final_for_ml.csv", "nhs_ae_features.csv", "nhs_ae_merged_fixed.csv", "nhs_ae_merged.csv"]

# Try to find any of these files
found_file = None
for filename in files_to_try:
    file_path = find_file(filename, project_dir)
    if file_path:
        found_file = file_path
        print(f"Found file: {found_file}")
        break

if not found_file:
    print("Could not find any of the dataset files!")
    exit(1)

# Load the dataset
df = pd.read_csv(found_file)

# Total Attendances
total_attendances = df["total_a&e_attendances"].sum()
print(f"Total Attendances: {total_attendances:,.1f}")

# Number of Hospital Systems (unique organizations)
hospital_systems = df["org_name"].nunique()
print(f"Number of Hospital Systems: {hospital_systems}")

# Time period
try:
    df["date"] = pd.to_datetime(df["date"])
    start_date = df["date"].min().strftime("%B %Y")
    end_date = df["date"].max().strftime("%B %Y")
    months_analyzed = ((df["date"].max() - df["date"].min()).days // 30) + 1
    print(f"Date Range: {start_date} to {end_date}")
    print(f"Months Analyzed: {months_analyzed}")
except KeyError:
    # If 'date' column doesn't exist, try to create it
    try:
        df["date"] = pd.to_datetime(df["year"].astype(str) + "-" + df["month"], format="%Y-%B")
        start_date = df["date"].min().strftime("%B %Y")
        end_date = df["date"].max().strftime("%B %Y")
        months_analyzed = ((df["date"].max() - df["date"].min()).days // 30) + 1
        print(f"Date Range: {start_date} to {end_date}")
        print(f"Months Analyzed: {months_analyzed}")
    except:
        print("Could not determine date range (date column not found)")
        
# Save summary as JSON for frontend use
summary = {
    "total_attendances": round(total_attendances, 1),
    "hospital_systems": int(hospital_systems),
    "date_range": f"{start_date} to {end_date}",
    "months_analyzed": int(months_analyzed)
}

output_dir = os.path.join(project_dir, "Final-Year-Project", "final-year-yroject", "public", "data")
os.makedirs(output_dir, exist_ok=True)

output_file = os.path.join(output_dir, "ae_summary.json")
with open(output_file, "w") as f:
    import json
    json.dump(summary, f, indent=4)

print(f"Saved summary data to {output_file}")

# Generate Monthly Attendance JSON
print("Generating monthly_attendance.json...")

# Create pivot: average monthly attendance per year
df["year"] = df["date"].dt.year
df["month_name"] = df["date"].dt.month_name()
month_order = ["January", "February", "March", "April", "May", "June",
               "July", "August", "September", "October", "November", "December"]
df["month_name"] = pd.Categorical(df["month_name"], categories=month_order, ordered=True)

monthly_data = df.groupby(["year", "month_name"])["total_a&e_attendances"].mean().reset_index()
pivot = monthly_data.pivot(index="month_name", columns="year", values="total_a&e_attendances").fillna(0)

monthly_attendance_json = {
    "labels": list(pivot.index),
    "datasets": [
        {
            "label": str(year),
            "data": [round(val / 1_000_000, 2) for val in pivot[year]]
        }
        for year in pivot.columns
    ]
}

# Save chart data
monthly_output_file = os.path.join(output_dir, "monthly_attendance.json")
with open(monthly_output_file, "w") as f:
    json.dump(monthly_attendance_json, f, indent=2)

print(f"✅ Saved monthly attendance chart to {monthly_output_file}")
