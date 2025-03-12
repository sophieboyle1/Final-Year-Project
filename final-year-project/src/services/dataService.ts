import axios from "axios";

const API_URL = "http://127.0.0.1:5000/api";

// ✅ Define the correct AandEData interface
export interface AandEData {
    year: number;
    type: string; // Ensure this matches the actual data structure
    total: number;
    type1: number;
    type2: number;
    type3: number;
}

// ✅ Fetch A&E Data Function
export const fetchAandEData = async (): Promise<AandEData[]> => {
    try {
        const response = await axios.get<AandEData[]>(`${API_URL}/ae_data`);
        return response.data;
    } catch (error) {
        console.error("Error fetching A&E data:", error);
        throw error;
    }
};
