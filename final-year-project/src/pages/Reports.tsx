import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle } from '@ionic/react';
import './Reports.css';

const Reports: React.FC = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching data from API...');
      try {
        const response = await fetch('http://127.0.0.1:5000/api/reports');
        console.log('API response:', response);
  
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        const result = await response.json();
        console.log('Data received:', result);
        setData(result);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  }, []);
  

  return (
    <IonPage>
      <IonHeader>
        <IonTitle>Reports</IonTitle>
      </IonHeader>
      <IonContent className="ion-padding">
        <h1>Daily A&E Reports</h1>
        {data.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Patients on Trolleys</th>
                <th>Waiting {'>'} 24 Hours</th>
                <th>Delayed Transfers</th>
                <th>Surge Capacity</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index}>
                  <td>{item["Unnamed: 0_level_0"] || "N/A"}</td>
                  <td>{item["Daily Trolley count"] || "N/A"}</td>
                  <td>{item["No of Total Waiting >24hrs"] || "N/A"}</td>
                  <td>{item["Delayed Transfers of Care (As of Midnight)"] || "N/A"}</td>
                  <td>{item["Surge Capacity in Use (Full report @14:00)"] || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Loading data...</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Reports;
