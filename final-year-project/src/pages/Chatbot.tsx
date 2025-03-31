import React, { useState } from 'react';
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

    const sendMessage = () => {
        if (!input.trim()) return;

        const userMessage = { from: 'user', text: input };
        setMessages([...messages, userMessage]);

        // Example dummy bot response
        const botReply = {
            from: 'bot',
            text: `You asked: "${input}" — this is where the prediction logic will respond.`,
        };
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
