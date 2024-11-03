import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle } from '@ionic/react';
import './Reports.css';

const Reports: React.FC = () => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/reports');
        const result = await response.json();
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
        {data ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Patients on Trolleys</th>
                <th>Waiting {'>'}24 Hours</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item: any) => (
                <tr key={item.date}>
                  <td>{item.date}</td>
                  <td>{item.trolleys}</td>
                  <td>{item.waitingMoreThan24Hours}</td>
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
