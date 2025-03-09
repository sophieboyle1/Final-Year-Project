import axios from "axios";

// Define A&E Data Structure
interface AandEData {
  year: string;
  type: string;
  attendances: number;
}

const API_URL = "http://localhost:5000/api";

// ✅ Fetch A&E Data 
export const fetchAandEData = async (): Promise<AandEData[]> => {
  try {
    const response = await axios.get<AandEData[]>(`${API_URL}/ae_data`);
    return response.data;
  } catch (error) {
    console.error("Error fetching A&E data:", error);
    throw error;
  }
};

// ✅ Fetch Reports
export const fetchReportData = async (date: string = "") => {
  try {
    const response = await axios.get(`${API_URL}/reports${date ? `?date=${date}` : ""}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching report data:", error);
    throw error;
  }
};
