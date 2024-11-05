import React, { useEffect, useState } from 'react';
import { IonContent, IonHeader, IonPage, IonTitle } from '@ionic/react';
import './Reports.css';
import Header from './Header';

interface ReportsProps {
  reportData: any[]; // Define the prop type
}

const Reports: React.FC<ReportsProps> = ({ reportData }) => { // Destructure reportData from props
  return (
    <IonPage>
      <Header />
      <IonContent className="ion-padding">
        <h1>Daily A&E Reports</h1>
        {reportData.length > 0 ? (
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
              {reportData.map((item, index) => (
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
