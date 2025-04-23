import pandas as pd
import os
import json
import numpy as np
from scipy import stats

# Print current working directory
print(f"Current working directory: {os.getcwd()}")

# Go up to the main project directory
project_dir = os.path.dirname(os.path.abspath(__file__))

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

# Clean total_a&e_attendances column before calculations
df["total_a&e_attendances"] = pd.to_numeric(df["total_a&e_attendances"], errors="coerce")
# Replace infinite values with NaN
df["total_a&e_attendances"].replace([np.inf, -np.inf], np.nan, inplace=True)
# Fill NaN with median value
median_value = df["total_a&e_attendances"].median()
df["total_a&e_attendances"].fillna(median_value, inplace=True)

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
    try:
        df["date"] = pd.to_datetime(df["year"].astype(str) + "-" + df["month"], format="%Y-%B")
        start_date = df["date"].min().strftime("%B %Y")
        end_date = df["date"].max().strftime("%B %Y")
        months_analyzed = ((df["date"].max() - df["date"].min()).days // 30) + 1
        print(f"Date Range: {start_date} to {end_date}")
        print(f"Months Analyzed: {months_analyzed}")
    except:
        print("Could not determine date range (date column not found)")

# Save summary as JSON
summary = {
    "total_attendances": round(total_attendances, 1),
    "hospital_systems": int(hospital_systems),
    "date_range": f"{start_date} to {end_date}",
    "months_analyzed": int(months_analyzed)
}

output_dir = os.path.abspath(os.path.join(project_dir, "../../../final-year-project/public/data"))

os.makedirs(output_dir, exist_ok=True)

output_file = os.path.join(output_dir, "ae_summary.json")
with open(output_file, "w") as f:
    json.dump(summary, f, indent=4)

print(f"✅ Saved summary data to {output_file}")

# Generate Monthly Attendance JSON
print("Generating monthly_attendance.json...")

df["year"] = df["date"].dt.year
df["month_name"] = df["date"].dt.month_name()
month_order = ["January", "February", "March", "April", "May", "June",
               "July", "August", "September", "October", "November", "December"]
df["month_name"] = pd.Categorical(df["month_name"], categories=month_order, ordered=True)

# Use observed=True parameter to avoid FutureWarning
monthly_data = df.groupby(["year", "month_name"], observed=True)["total_a&e_attendances"].sum().reset_index()
pivot = monthly_data.pivot(index="month_name", columns="year", values="total_a&e_attendances")
pivot = pivot.interpolate(method="linear", axis=0).bfill().ffill().round(2)

print("\nRaw monthly attendance values (first few rows):")
print(pivot.head())

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

monthly_output_file = os.path.join(output_dir, "monthly_attendance.json")
with open(monthly_output_file, "w") as f:
    json.dump(monthly_attendance_json, f, indent=2)

print(f"✅ Saved monthly attendance chart to {monthly_output_file}")

# ------------------------
# Generate Seasonal Attendance JSON
# ------------------------
print("Generating seasonal_attendance.json...")

month_to_season = {
    "January": "Winter", "February": "Winter", "December": "Winter",
    "March": "Spring", "April": "Spring", "May": "Spring",
    "June": "Summer", "July": "Summer", "August": "Summer",
    "September": "Autumn", "October": "Autumn", "November": "Autumn",
}

# Create empty structure to hold totals
seasonal_totals = {}
season_counts = {}

for year in pivot.columns:
    seasonal_totals[year] = {"Winter": 0, "Spring": 0, "Summer": 0, "Autumn": 0}
    season_counts[year] = {"Winter": 0, "Spring": 0, "Summer": 0, "Autumn": 0}
    for month in pivot.index:
        season = month_to_season.get(month)
        value = pivot.at[month, year]
        if pd.notna(value):
            seasonal_totals[year][season] += value
            season_counts[year][season] += 1

# Build JSON
season_labels = ["Winter", "Spring", "Summer", "Autumn"]
seasonal_attendance_json = {
    "labels": season_labels,
    "datasets": []
}

for year in sorted(pivot.columns):
    seasonal_values = []
    for season in season_labels:
        total = seasonal_totals[year][season]
        count = season_counts[year][season]
        avg = total / count if count > 0 else 0
        seasonal_values.append(round(avg / 1_000_000, 2))
    seasonal_attendance_json["datasets"].append({
        "label": str(year),
        "data": seasonal_values
    })

seasonal_output_file = os.path.join(output_dir, "seasonal_attendance.json")
with open(seasonal_output_file, "w") as f:
    json.dump(seasonal_attendance_json, f, indent=2)

print(f"✅ Saved seasonal attendance chart to {seasonal_output_file}")

# ------------------------
# Generate Performance Trend JSON
# ------------------------
print("Generating performance_trend.json...")

# Ensure the columns exist, using default values of 0 if they don't
number_cols = ["number_of_attendances_over_4hrs_type_1", 
               "number_of_attendances_over_4hrs_type_2", 
               "number_of_attendances_over_4hrs_other_a&e_department"]

for col in number_cols:
    if col not in df.columns:
        df[col] = 0
    else:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

# Total number over 4 hours (across all department types)
df["total_over_4hrs"] = (
    df["number_of_attendances_over_4hrs_type_1"] +
    df["number_of_attendances_over_4hrs_type_2"] +
    df["number_of_attendances_over_4hrs_other_a&e_department"]
)

# Calculate % seen within 4 hours
df["seen_within_4hrs_percent"] = df.apply(
    lambda row: max(0, min(100, 100 - (row["total_over_4hrs"] / row["total_a&e_attendances"] * 100)))
    if row["total_a&e_attendances"] > 0 else 0,
    axis=1
)

# Group by year and average the percentages
performance_by_year = df.groupby("year")["seen_within_4hrs_percent"].mean().round(2).reset_index()

# Build JSON format
performance_json = {
    "labels": performance_by_year["year"].astype(str).tolist(),
    "datasets": [{
        "label": "% Patients Seen Within 4 Hours",
        "data": performance_by_year["seen_within_4hrs_percent"].tolist(),
        "backgroundColor": "#3366CC"
    }]
}

# Save to file
performance_output_file = os.path.join(output_dir, "performance_trend.json")
with open(performance_output_file, "w") as f:
    json.dump(performance_json, f, indent=2)

print(f"✅ Saved performance trend chart to {performance_output_file}")

# ------------------------
# Generate Regional Comparison JSON
# ------------------------
print("Generating regional_comparison.json...")

# Remove rows with weird org names like 'TOTAL' variants
valid_df = df[~df["org_name"].str.strip().str.upper().isin(["TOTAL"])]

regional_totals = valid_df.groupby("org_name")["total_a&e_attendances"].sum().sort_values(ascending=False)
top_5 = regional_totals.head(5)
bottom_5 = regional_totals.tail(5)

regional_json = {
    "top_5": [{"org_name": name, "attendances": int(val)} for name, val in top_5.items()],
    "bottom_5": [{"org_name": name, "attendances": int(val)} for name, val in bottom_5.items()]
}

regional_output_file = os.path.join(output_dir, "regional_comparison.json")
with open(regional_output_file, "w") as f:
    json.dump(regional_json, f, indent=2)

print(f"✅ Saved regional comparison chart to {regional_output_file}")

# ------------------------
# Generate Patient Pathway Funnel JSON
# ------------------------
print("Generating funnel_data.json...")

# Clean all relevant columns safely
cols_to_clean = [
    "total_a&e_attendances",
    "number_of_attendances_over_4hrs_type_1",
    "number_of_attendances_over_4hrs_type_2",
    "number_of_attendances_over_4hrs_other_a&e_department",
    "emergency_admissions_via_a&e_-_type_1",
    "emergency_admissions_via_a&e_-_type_2",
    "emergency_admissions_via_a&e_-_other_a&e_department",
    "other_emergency_admissions"
]

for col in cols_to_clean:
    if col in df.columns:
        df[col] = pd.to_numeric(df.get(col, 0), errors="coerce").replace([float('inf'), -float('inf')], pd.NA).fillna(0)
    else:
        df[col] = 0

# Compute columns
df["total_over_4hrs"] = (
    df["number_of_attendances_over_4hrs_type_1"] +
    df["number_of_attendances_over_4hrs_type_2"] +
    df["number_of_attendances_over_4hrs_other_a&e_department"]
)

seen_within_4hrs = df["total_a&e_attendances"].sum() - df["total_over_4hrs"].sum()

# Add emergency admissions columns if they don't exist
emergency_cols = ["emergency_admissions_via_a&e_-_type_1", 
                  "emergency_admissions_via_a&e_-_type_2", 
                  "emergency_admissions_via_a&e_-_other_a&e_department",
                  "other_emergency_admissions"]
                  
for col in emergency_cols:
    if col not in df.columns:
        df[col] = 0
    else:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

df["total_emergency_admissions"] = (
    df["emergency_admissions_via_a&e_-_type_1"] +
    df["emergency_admissions_via_a&e_-_type_2"] +
    df["emergency_admissions_via_a&e_-_other_a&e_department"] +
    df["other_emergency_admissions"]
)

# Ensure final values are safe before casting to int
total_attendances_val = df["total_a&e_attendances"].sum()
seen_within_val = seen_within_4hrs
admitted_val = df["total_emergency_admissions"].sum()

if all(pd.notna([total_attendances_val, seen_within_val, admitted_val])):
    funnel_json = {
        "stages": ["Total Attendances", "Seen Within 4 Hours", "Admitted to Hospital"],
        "values": [
            int(round(total_attendances_val)),
            int(round(seen_within_val)),
            int(round(admitted_val))
        ]
    }

    funnel_output_file = os.path.join(output_dir, "funnel_data.json")
    with open(funnel_output_file, "w") as f:
        json.dump(funnel_json, f, indent=2)

    print(f"✅ Saved funnel data chart to {funnel_output_file}")
else:
    print("⚠️ Funnel chart skipped due to invalid numeric values.")

# ------------------------
# Generate Z-score Anomaly Chart JSON
# ------------------------
print("Generating zscore_anomalies.json...")

from scipy import stats  # make sure this is imported near the top

# Step 1: Group by month and sum total attendances
monthly_df = df.groupby(df["date"].dt.to_period("M")).agg({
    "total_a&e_attendances": "sum"
}).reset_index()

# Step 2: Convert period back to timestamp
monthly_df["date"] = monthly_df["date"].dt.to_timestamp()

# Step 3: Calculate Z-score and flag outliers
monthly_df["attendance_zscore"] = np.abs(stats.zscore(monthly_df["total_a&e_attendances"], nan_policy='omit'))
monthly_df["is_outlier"] = monthly_df["attendance_zscore"] > 3.0

# Step 4: Create chart-friendly JSON
zscore_data = {
    "labels": monthly_df["date"].dt.strftime("%b %Y").tolist(),
    "datasets": [
        {
            "label": "Monthly A&E Attendances",
            "data": monthly_df["total_a&e_attendances"].tolist(),
            "borderColor": "#3366CC",
            "backgroundColor": "transparent",
            "tension": 0.3,
            "pointBackgroundColor": [
                "#DC3912" if outlier else "#3366CC"
                for outlier in monthly_df["is_outlier"]
            ],
            "pointRadius": [
                6 if outlier else 2
                for outlier in monthly_df["is_outlier"]
            ],
        }
    ]
}

# Step 5: Save the file
zscore_output_file = os.path.join(output_dir, "zscore_anomalies.json")
with open(zscore_output_file, "w") as f:
    json.dump(zscore_data, f, indent=2)

print(f"✅ Saved Z-score anomalies chart to {zscore_output_file}")
