import React, { useState, useEffect } from 'react';
import './Chatbot.css';
import {
    IonPage,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonInput,
    IonButton,
    IonFooter,
    IonList,
    IonItem,
    IonLabel,
} from '@ionic/react';

const Chatbot: React.FC = () => {
    const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
    const [input, setInput] = useState('');
    const [predictionsData, setPredictionsData] = useState<any>(null);

    // Load predictions.json once when component mounts
    useEffect(() => {
        fetch('./public/predictions.json')
            .then((res) => res.json())
            .then((data) => setPredictionsData(data))
            .catch((err) => console.error('Failed to load predictions:', err));
    }, []);

    const sendMessage = () => {
        if (!input.trim()) return;

        const userMessage = { from: 'user', text: input };
        setMessages((prev) => [...prev, userMessage]);

        let botText = "🤖 Sorry, I couldn't understand your question.";

        if (predictionsData) {
            const lowerInput = input.toLowerCase();

            // Try to find a hospital + date match
            const match = predictionsData.predictions.find((record: any) => {
                return lowerInput.includes(record.org_name.toLowerCase()) &&
                       lowerInput.includes(record.date);
            });

            if (match) {
                botText = `📅 On ${match.date}, at **${match.org_name}**:\n- 🧮 Predicted: ${Math.round(match.Predicted)}\n- ✅ Actual: ${Math.round(match.Actual)}`;
            } else if (lowerInput.includes("mse") || lowerInput.includes("r2")) {
                botText = `📊 Model Performance:\n- MSE: ${predictionsData.mse.toFixed(2)}\n- R² Score: ${predictionsData.r2.toFixed(2)}`;
            }
        }

        const botReply = { from: 'bot', text: botText };

        setTimeout(() => {
            setMessages((prev) => [...prev, botReply]);
        }, 500);

        setInput('');
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Chat with the Prediction Bot</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="chatbot-content">
                <div className="chatbot-box">
                    <IonList className="chat-list">
                        {messages.map((msg, index) => (
                            <IonItem
                                key={index}
                                lines="none"
                                className={msg.from === 'user' ? 'user-message' : 'bot-message'}
                            >
                                <IonLabel className="message-text">{msg.text}</IonLabel>
                            </IonItem>
                        ))}
                    </IonList>
                </div>
            </IonContent>

            <IonFooter className="chatbot-footer">
                <IonToolbar className="footer-toolbar">
                    <IonInput
                        value={input}
                        placeholder="Type your question..."
                        onIonChange={(e) => setInput(e.detail.value!)}
                        className="chat-input"
                    />
                    <IonButton onClick={sendMessage}>Send</IonButton>
                </IonToolbar>
            </IonFooter>
        </IonPage>
    );
};

export default Chatbot;
