import React, { useState } from 'react';
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
import './Chatbot.css';

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

      <IonContent className="ion-padding">
        <IonList>
          {messages.map((msg, index) => (
            <IonItem
              key={index}
              className={msg.from === 'user' ? 'user-message' : 'bot-message'}
            >
              <IonLabel>{msg.text}</IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <IonInput
            value={input}
            placeholder="Type your question..."
            onIonChange={(e) => setInput(e.detail.value!)}
          />
          <IonButton onClick={sendMessage}>Send</IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Chatbot;
