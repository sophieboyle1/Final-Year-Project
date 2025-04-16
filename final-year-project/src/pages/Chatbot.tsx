import React, { useState, useEffect } from 'react';
import Header from "./Header";
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
            
            console.log(`Matched: Location=${matchedLocation}, Month=${matchedMonth}, Year=${matchedYear}, MonthKey=${monthKey}`);
            
            // Find the most relevant prediction
            let bestMatch = null;
            let allYearMatches = [];

            // Handle model performance questions
            if (lowerInput.includes("mse") || lowerInput.includes("r2") || 
                lowerInput.includes("model") || lowerInput.includes("performance") || 
                lowerInput.includes("accuracy")) {
                botText = `📊 Model Performance Metrics:\n- MSE (Mean Squared Error): ${predictionsData.mse.toFixed(2)}\n- R² Score: ${predictionsData.r2.toFixed(2)}\n\nOur Random Forest model achieved a prediction accuracy of ${(predictionsData.r2 * 100).toFixed(1)}%.`;
            }
            // Handle help request
            else if (lowerInput.includes("help") || lowerInput.includes("what can you")) {
                botText = "🤖 I can help you with:\n\n" +
                        "• A&E attendance predictions for specific hospitals\n" +
                        "• Model performance metrics\n" +
                        "• Comparing predicted vs actual attendances\n\n" +
                        "Try asking something like 'What's the predicted attendance for Birmingham in June 2025?' or 'How accurate is your model?'";
            }
            // Handle specific predictions
            else if (matchedLocation) {
                // Strategy 1: If both year and month specified, try the exact match
                if (matchedYear && monthKey) {
                    const datePrefix = `${matchedYear}-${monthKey}`;
                    for (const record of predictionsData.predictions) {
                        if (record.date.startsWith(datePrefix) && 
                            record.org_name.toLowerCase().includes(matchedLocation)) {
                            bestMatch = record;
                            break;
                        }
                    }
                }
                
                // Strategy 2: If only year specified, get all matches from that year
                if (matchedYear && !monthKey) {
                    allYearMatches = predictionsData.predictions.filter(record => 
                        record.date.startsWith(matchedYear) && 
                        record.org_name.toLowerCase().includes(matchedLocation)
                    );
                    
                    // If we found matches for that year, use them
                    if (allYearMatches.length > 0) {
                        // If just one match, use it as the best match
                        if (allYearMatches.length === 1) {
                            bestMatch = allYearMatches[0];
                        }
                        // Otherwise, we'll format a special summary response
                    }
                }
                
                // Strategy 3: If no year matches were found, try to find the latest data for this location
                if (!bestMatch && allYearMatches.length === 0) {
                    // Get all matches for this location, sorted by date (newest first)
                    const locationMatches = predictionsData.predictions
                        .filter(record => record.org_name.toLowerCase().includes(matchedLocation))
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    
                    if (locationMatches.length > 0) {
                        // If year was specified but no matches found for that year
                        if (matchedYear) {
                            const latestDate = new Date(locationMatches[0].date)
                                .toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
                            
                            botText = `🤖 I don't have specific predictions for ${matchedLocation.charAt(0).toUpperCase() + matchedLocation.slice(1)} in ${matchedYear} yet. ` + 
                                      `The latest available data is from ${latestDate}:\n\n` +
                                      `📈 For ${locationMatches[0].org_name} in ${latestDate}:\n\n` +
                                      `• Predicted A&E Attendance: **${Math.round(locationMatches[0].Predicted).toLocaleString()}**\n` +
                                      `• Actual Attendance: **${locationMatches[0].Actual !== null ? Math.round(locationMatches[0].Actual).toLocaleString() : "Not available yet"}**`;
                        }
                        // If no year specified, use the latest data
                        else {
                            bestMatch = locationMatches[0];
                        }
                    }
                }
                
                // Format response based on the matches we found
                if (allYearMatches.length > 1) {
                    // Create a summary for the whole year
                    const totalPredicted = allYearMatches.reduce((sum, record) => sum + record.Predicted, 0);
                    const actualValues = allYearMatches.filter(record => record.Actual !== null);
                    const totalActual = actualValues.length > 0 
                        ? actualValues.reduce((sum, record) => sum + record.Actual, 0)
                        : null;
                    
                    const actualText = totalActual !== null 
                        ? `**${Math.round(totalActual).toLocaleString()}**` 
                        : "**Not available yet**";
                    
                    botText = `📈 For ${allYearMatches[0].org_name} in ${matchedYear}:\n\n` +
                              `• Predicted Annual A&E Attendance: **${Math.round(totalPredicted).toLocaleString()}**\n` +
                              `• Actual Attendance (${actualValues.length} months): ${actualText}\n\n` +
                              `I have data for ${allYearMatches.length} months in ${matchedYear}. Ask about a specific month for details.`;
                }
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
                <div className="chatbot-box">
                    <IonList className="chat-list">
                        {messages.length === 0 && (
                            <IonItem lines="none" className="bot-message">
                                <IonLabel className="message-text">
                                    👋 Hello! I can help you with A&E attendance predictions. Try asking about 
                                    predictions for a specific hospital and time period, or type "help" for more info.
                                </IonLabel>
                            </IonItem>
                        )}
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
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <IonButton onClick={sendMessage}>Send</IonButton>
                </IonToolbar>
            </IonFooter>
        </IonPage>
    );
};

export default Chatbot;