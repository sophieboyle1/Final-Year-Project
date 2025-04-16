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

    // Load predictions data on component mount
    useEffect(() => {
        fetch('/data/predictions.json')
            .then((res) => res.json())
            .then((data) => {
                console.log("Loaded predictions:", data);
                setPredictionsData(data);
            })
            .catch((err) => console.error('Failed to load predictions:', err));
    }, []);

    const sendMessage = () => {
        if (!input.trim()) return;

        const userMessage = { from: 'user', text: input };
        setMessages((prev) => [...prev, userMessage]);

        let botText = "🤖 Sorry, I couldn't understand your question. Try asking about A&E attendance predictions for a specific hospital and time period.";

        if (predictionsData) {
            const lowerInput = input.toLowerCase();
            console.log("Processing query:", lowerInput);

            // Extract location (more flexible matching)
            const locations = [
                "birmingham", "london", "manchester", "leeds", "liverpool", 
                "newcastle", "bristol", "sheffield", "nottingham", "southampton"
            ];
            const matchedLocation = locations.find(loc => lowerInput.includes(loc));

            // Extract month and year (more flexible)
            const monthMap = {
                "january": "01", "jan": "01", "february": "02", "feb": "02", 
                "march": "03", "mar": "03", "april": "04", "apr": "04",
                "may": "05", "june": "06", "jun": "06", "july": "07", "jul": "07", 
                "august": "08", "aug": "08", "september": "09", "sep": "09", 
                "october": "10", "oct": "10", "november": "11", "nov": "11", 
                "december": "12", "dec": "12"
            };

            // Match years (2020-2026)
            const yearMatch = lowerInput.match(/\b(202[0-6])\b/);
            const matchedYear = yearMatch ? yearMatch[0] : null;

            // Match full month names or abbreviations
            const monthPattern = Object.keys(monthMap).join("|");
            const monthMatch = lowerInput.match(new RegExp(`\\b(${monthPattern})\\b`));
            const matchedMonth = monthMatch ? monthMatch[0] : null;

            // Use this approach to safely access the month map
            let monthKey: string | null = null;
            if (matchedMonth && Object.prototype.hasOwnProperty.call(monthMap, matchedMonth)) {
                monthKey = monthMap[matchedMonth as keyof typeof monthMap];
            }

            // Then use monthKey in your date string
            const datePrefix = (matchedYear && monthKey) ? `${matchedYear}-${monthKey}` : null;
            
            console.log(`Matched: Location=${matchedLocation}, Month=${matchedMonth}, Year=${matchedYear}, Prefix=${datePrefix}`);
            
            // Find the most relevant prediction
            let bestMatch = null;

            // First try to match all criteria if provided
            if (matchedLocation && datePrefix) {
                for (const record of predictionsData.predictions) {
                    if (record.date.startsWith(datePrefix) && 
                        record.org_name.toLowerCase().includes(matchedLocation)) {
                        bestMatch = record;
                        break;
                    }
                }
            }
            
            // If no match, try with just location and any date
            if (!bestMatch && matchedLocation) {
                for (const record of predictionsData.predictions) {
                    if (record.org_name.toLowerCase().includes(matchedLocation)) {
                        bestMatch = record;
                        break;
                    }
                }
            }

            // Handle model performance questions
            if (lowerInput.includes("mse") || lowerInput.includes("r2") || 
                lowerInput.includes("model") || lowerInput.includes("performance") || 
                lowerInput.includes("accuracy")) {
                botText = `📊 Model Performance Metrics:\n- MSE (Mean Squared Error): ${predictionsData.mse.toFixed(2)}\n- R² Score: ${predictionsData.r2.toFixed(2)}\n\nOur Random Forest model achieved a prediction accuracy of ${(predictionsData.r2 * 100).toFixed(1)}%.`;
            }
            // Handle prediction results
            else if (bestMatch) {
                const predicted = Math.round(bestMatch.Predicted);
                const actual = bestMatch.Actual !== null ? Math.round(bestMatch.Actual) : "Not available yet";
                const date = new Date(bestMatch.date).toLocaleDateString('en-GB', {
                    month: 'long', 
                    year: 'numeric'
                });
                
                botText = `📈 For ${bestMatch.org_name} in ${date}:\n\n` +
                        `• Predicted A&E Attendance: **${predicted.toLocaleString()}**\n` +
                        `• Actual Attendance: **${actual.toLocaleString()}**`;
            }
            // Handle general questions
            else if (lowerInput.includes("help") || lowerInput.includes("what can you")) {
                botText = "🤖 I can help you with:\n\n" +
                        "• A&E attendance predictions for specific hospitals\n" +
                        "• Model performance metrics\n" +
                        "• Comparing predicted vs actual attendances\n\n" +
                        "Try asking something like 'What's the predicted attendance for Birmingham in June 2025?' or 'How accurate is your model?'";
            }
        }

        const botReply = { from: 'bot', text: botText };
        setTimeout(() => setMessages((prev) => [...prev, botReply]), 500);
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