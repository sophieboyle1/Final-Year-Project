import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reports';

// Function to fetch report data
export const fetchReportData = async (date = '') => {
    try {
        const response = await axios.get(`${API_URL}${date ? `?date=${date}` : ''}`);
        return response.data; 
    } catch (error) {
        console.error('Error fetching report data:', error);
        throw error;  
    }
};
