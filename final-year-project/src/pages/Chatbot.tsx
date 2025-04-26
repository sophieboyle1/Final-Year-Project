import React, { useState, useEffect } from 'react';
import Header from "./Header";
import './Chatbot.css';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonInput, IonButton, IonFooter, IonList, IonItem, IonLabel
} from '@ionic/react';

// Interfaces
interface Prediction {
    date: string;
    org_name: string;
    Predicted: number;
    Actual: number | null;
}

interface PredictionsData {
    predictions: Prediction[];
    mse: number;
    r2: number;
}

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
    const [input, setInput] = useState('');
    const [predictionsData, setPredictionsData] = useState<PredictionsData | null>(null);
    const [hospitalTrusts, setHospitalTrusts] = useState<string[]>([]);

    useEffect(() => {
        // Try multiple paths to handle both development and production environments
        const fetchData = async () => {
            try {
                const paths = ['./data/predictions.json', '/data/predictions.json', '../data/predictions.json'];
                
                for (const path of paths) {
                    try {
                        const response = await fetch(path);
                        if (response.ok) {
                            const data = await response.json();
                            setPredictionsData(data);
                            const trusts = Array.from(new Set(data.predictions.map((r: Prediction) => r.org_name.toLowerCase()))) as string[];
                            setHospitalTrusts(trusts);
                            console.log(`Successfully loaded data from ${path}`);
                            return;
                        }
                    } catch (e) {
                        console.log(`Failed to load from ${path}:`, e);
                    }
                }
                
                throw new Error('Could not load predictions from any path');
            } catch (err) {
                console.error('Failed to load predictions:', err);
            }
        };

        fetchData();
    }, []);

    const sendMessage = () => {
        if (!input.trim()) return;

        const userMessage = { from: 'user', text: input };
        setMessages((prev) => [...prev, userMessage]);

        let botText = "🤖 Sorry, I couldn't understand your question. Try asking about A&E attendance predictions for a specific hospital and time period.";

        if (predictionsData) {
            const lowerInput = input.toLowerCase();

            const matchedTrust = hospitalTrusts.find(trust => lowerInput.includes(trust.split(' ')[0]));
            const matchedLocation = matchedTrust || null;

            const monthMap: { [key: string]: string } = {
                "january": "01", "february": "02", "march": "03", "april": "04", "may": "05", "june": "06",
                "july": "07", "august": "08", "september": "09", "october": "10", "november": "11", "december": "12"
            };

            const yearMatch = lowerInput.match(/\b(202[0-6])\b/);
            const matchedYear = yearMatch ? yearMatch[0] : null;

            const monthPattern = Object.keys(monthMap).join("|");
            const monthMatch = lowerInput.match(new RegExp(`\\b(${monthPattern})\\b`));
            const matchedMonth = monthMatch ? monthMap[monthMatch[0].toLowerCase()] : null;

            if (lowerInput.includes("mse") || lowerInput.includes("r2") || lowerInput.includes("performance")) {
                botText = `📊 Model Performance:\nMSE: ${predictionsData.mse.toFixed(2)}\nR² Score: ${predictionsData.r2.toFixed(2)}`;
            } else if (lowerInput.includes("help") || lowerInput.includes("what can you")) {
                botText = "🤖 I can help you with:\n• A&E predictions for specific hospitals\n• Model performance\n• Comparing predicted vs actual\n• Trend analysis\n\nExample questions:\n- 'Forecast for Newcastle December 2024'\n- 'Trend for Kettering 2023 to 2025'\n- 'Model accuracy?'";
            } else if (matchedLocation && matchedYear && matchedMonth) {
                const datePrefix = `${matchedYear}-${matchedMonth}`;
                const match = predictionsData.predictions.find((p: Prediction) =>
                    p.date.startsWith(datePrefix) && p.org_name.toLowerCase().includes(matchedLocation.split(' ')[0])
                );
                if (match) {
                    botText = `📈 ${match.org_name} (${datePrefix}):\nPredicted: ${match.Predicted.toLocaleString()}\nActual: ${match.Actual !== null ? match.Actual.toLocaleString() : 'Not available'}`;
                }
            }
        }

        const botReply = { from: 'bot', text: botText };
        setTimeout(() => setMessages((prev) => [...prev, botReply]), 500);
        setInput('');
    };

    return (
        <IonPage>
            <Header />
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Chat with the Prediction Bot</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="chatbot-content">
                <div className="suggested-questions">
                    <strong>Example Questions:</strong>
                    <ul>
                        <li>📈 Forecast for Newcastle December 2024</li>
                        <li>📊 Trend for Kettering 2023-2025</li>
                        <li>🧠 Model accuracy</li>
                    </ul>
                </div>
                <div className="chatbot-box">
                    <IonList className="chat-list">
                        {messages.map((msg, index) => (
                            <IonItem key={index} lines="none" className={msg.from === 'user' ? 'user-message' : 'bot-message'}>
                                <IonLabel className="message-text">{msg.text}</IonLabel>
                            </IonItem>
                        ))}
                    </IonList>
                </div>
            </IonContent>

            <IonFooter className="chatbot-footer">
                <IonToolbar>
                    <IonInput
                        value={input}
                        placeholder="Type your question..."
                        onIonChange={(e) => setInput(e.detail.value!)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <IonButton onClick={sendMessage}>Send</IonButton>
                </IonToolbar>
                <footer style={{ textAlign: "center", padding: "1rem", fontSize: "small", color: "#888" }}>
                    © 2025 NHS A&E Data Insights – Final Year Project by Sophie Boyle
                </footer>
            </IonFooter>
        </IonPage>
    );
};

export default Chatbot;