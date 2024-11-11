import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import './Reports.css';
import Header from './Header';

interface ReportsProps {
  reportData: any[];
}

const Reports: React.FC<ReportsProps> = ({ reportData }) => {
  return (
    <IonPage>
      <Header />
      <IonContent className="ion-padding">
        <h1>Daily A&E Reports</h1>
        {reportData.length > 0 ? (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Patients on Trolleys</th>
                  <th>Waiting &gt; 24 Hours</th>
                  <th>Delayed Transfers</th>
                  <th>Surge Capacity</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, index) => (
                  <tr key={index}>
                    <td>{item["Daily Trolley count"] || "-"}</td>
                    <td>{item["Daily Trolley count.1"] || "-"}</td>
                    <td>{item["No of Total Waiting >24hrs"] || "-"}</td>
                    <td style={{ color: item["Delayed Transfers of Care (As of Midnight)"] > 50 ? 'red' : 'black' }}>
                      {item["Delayed Transfers of Care (As of Midnight)"] || "-"}
                    </td>
                    <td>{item["Surge Capacity in Use (Full report @14:00)"] || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>Loading data...</p>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Reports;
