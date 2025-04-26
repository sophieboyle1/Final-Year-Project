import React, { useState, useEffect } from 'react';
import Header from "./Header";
import './Chatbot.css';
import {
    IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
    IonInput, IonButton, IonFooter, IonList, IonItem, IonLabel
} from '@ionic/react';

// Interfaces for data structure
interface Prediction {
    date: string;            // Format: YYYY-MM-DD
    org_name: string;        // Hospital trust name
    Predicted: number;       // Predicted A&E attendance 
    Actual: number | null;   // Actual attendance (null for future dates)
}

interface PredictionsData {
    predictions: Prediction[];  // Array of prediction records
    mse: number;                // Mean Squared Error of the model
    r2: number;                 // R-squared score of the model
}

const Chatbot: React.FC = () => {
    // State management
    const [messages, setMessages] = useState<{ from: string; text: string }[]>([]); // Chat history
    const [input, setInput] = useState('');                                         // User input
    const [predictionsData, setPredictionsData] = useState<PredictionsData | null>(null); // Loaded prediction data
    const [hospitalTrusts, setHospitalTrusts] = useState<string[]>([]);             // List of unique hospitals

    useEffect(() => {
        // Add welcome message when component loads
        const welcomeMessage = { 
            from: 'bot', 
            text: "👋 Welcome to the NHS A&E Prediction Bot! I can help you explore attendance predictions for hospitals across the UK. Try asking about specific hospitals, time periods, or check the model's performance." 
        };
        setMessages([welcomeMessage]);
        
        // Load prediction data from JSON file
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
                            
                            // Extract unique hospital names (lowercase for case-insensitive matching)
                            const trusts = Array.from(new Set(data.predictions.map((r: Prediction) => r.org_name.toLowerCase()))) as string[];
                            setHospitalTrusts(trusts);
                            console.log(`Successfully loaded data from ${path}`);
                            console.log("Available hospitals in data:", trusts);
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
    }, []); // Empty dependency array ensures this runs only once on component mount

    // Handle sending a message and generating a response
    const sendMessage = () => {
        if (!input.trim()) return; // Don't process empty messages

        // Add user message to chat
        const userMessage = { from: 'user', text: input };
        setMessages((prev) => [...prev, userMessage]);

        // Default bot response if no match is found
        let botText = "🤖 Sorry, I couldn't understand your question. Try asking about A&E attendance predictions for a specific hospital and time period.";

        if (predictionsData) {
            const lowerInput = input.toLowerCase();
            
            // STEP 1: Match hospital name in the query
            // Improved hospital matching - looks for key words from hospital names
            const matchedTrust = hospitalTrusts.find(trust => {
                // Get key words from the trust name (usually first 1-2 words)
                const trustWords = trust.split(' ');
                const keyWords = trustWords.slice(0, Math.min(2, trustWords.length));
                
                // Check if any key word from the trust is in the input
                return keyWords.some(word => lowerInput.includes(word.toLowerCase()));
            });
            
            const matchedLocation = matchedTrust || null;

            // STEP 2: Match month and year in the query
            const monthMap: { [key: string]: string } = {
                "january": "01", "february": "02", "march": "03", "april": "04", "may": "05", "june": "06",
                "july": "07", "august": "08", "september": "09", "october": "10", "november": "11", "december": "12"
            };

            // Extract year from input (2020-2026)
            const yearMatch = lowerInput.match(/\b(202[0-6])\b/);
            const matchedYear = yearMatch ? yearMatch[0] : null;

            // Extract month from input
            const monthPattern = Object.keys(monthMap).join("|");
            const monthMatch = lowerInput.match(new RegExp(`\\b(${monthPattern})\\b`));
            const matchedMonth = monthMatch ? monthMap[monthMatch[0].toLowerCase()] : null;

            // Debug logging
            console.log("Input:", lowerInput);
            console.log("Matched hospital:", matchedLocation);
            console.log("Matched year:", matchedYear);
            console.log("Matched month:", matchedMonth);

            // STEP 3: Generate response based on query type
            
            // Handle model performance questions
            if (lowerInput.includes("mse") || lowerInput.includes("r2") || lowerInput.includes("performance") || 
                lowerInput.includes("accuracy") || lowerInput.includes("model")) {
                botText = `📊 Model Performance:\nMSE: ${predictionsData.mse.toFixed(2)}\nR² Score: ${predictionsData.r2.toFixed(2)}`;
            } 
            // Handle help questions
            else if (lowerInput.includes("help") || lowerInput.includes("what can you")) {
                botText = "🤖 I can help you with:\n• A&E predictions for specific hospitals\n• Model performance\n• Comparing predicted vs actual\n• Trend analysis\n\nExample questions:\n- 'Forecast for Newcastle December 2025'\n- 'Trend for Poole Hospital 2026'\n- 'Model accuracy?'";
            } 
            // Handle hospital listing questions
            else if (lowerInput.includes("list hospital") || lowerInput.includes("available hospital") || 
                     lowerInput.includes("show hospital") || lowerInput.includes("what hospital")) {
                // Get unique hospital names (first word only for brevity)
                const uniqueHospitals = Array.from(new Set(
                  predictionsData.predictions.map((p: Prediction) => {
                    const nameParts = p.org_name.split(' ');
                    return nameParts[0]; // Just return the first part of the name
                  })
                )).sort();
                
                botText = `📋 Available hospitals in the dataset:\n\n• ${uniqueHospitals.join('\n• ')}`;
            } 
            // Handle specific month+year+hospital queries
            else if (matchedLocation && matchedYear && matchedMonth) {
                const datePrefix = `${matchedYear}-${matchedMonth}`;
                const match = predictionsData.predictions.find((p: Prediction) =>
                    p.date.startsWith(datePrefix) && p.org_name.toLowerCase().includes(matchedLocation.split(' ')[0])
                );
                
                if (match) {
                    botText = `📈 ${match.org_name} (${datePrefix}):\nPredicted: ${match.Predicted !== null ? match.Predicted.toLocaleString() : 'Not available'}\nActual: ${match.Actual !== null ? match.Actual.toLocaleString() : 'Not available'}`;
                } else {
                    botText = `📊 I don't have specific data for ${matchedLocation} in ${monthMatch![0]} ${matchedYear}. Please try a different date or hospital.`;
                }
            } 
            // Handle year+hospital queries (without specific month)
            else if (matchedLocation && matchedYear) {
                // Find all predictions for the hospital in that year
                const yearMatches = predictionsData.predictions.filter((p: Prediction) =>
                    p.date.startsWith(matchedYear) && p.org_name.toLowerCase().includes(matchedLocation.split(' ')[0])
                );
                
                if (yearMatches.length > 0) {
                    const firstMatch = yearMatches[0];
                    const lastMatch = yearMatches[yearMatches.length - 1];
                    
                    // Calculate average monthly prediction
                    botText = `📈 ${firstMatch.org_name} (${matchedYear}):\n\nAverage monthly prediction: ${Math.round(yearMatches.reduce((sum, p) => sum + (p.Predicted || 0), 0) / yearMatches.length).toLocaleString()}\n\nRange: ${firstMatch.date.substring(0, 7)} to ${lastMatch.date.substring(0, 7)}`;
                } else {
                    botText = `📊 I don't have data for ${matchedLocation} in ${matchedYear}. Please try a different year or hospital.`;
                }
            }
        }

        // Add bot response to chat with a slight delay for realism
        const botReply = { from: 'bot', text: botText };
        setTimeout(() => setMessages((prev) => [...prev, botReply]), 500);
        setInput(''); // Clear input field
    };

    // UI Rendering
    return (
        <IonPage>
            <Header />
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Chat with the Prediction Bot</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent className="chatbot-content">
                {/* Question suggestion section */}
                <div className="suggested-questions">
                    <strong>Try asking:</strong>
                    <div className="question-buttons">
                        <button className="question-button" onClick={() => setInput("What's the prediction for Newcastle in December 2025?")}>
                            📈 Newcastle - December 2025
                        </button>
                        <button className="question-button" onClick={() => setInput("Show me Poole Hospital predictions for 2026")}>
                            🏥 Poole Hospital - 2026
                        </button>
                        <button className="question-button" onClick={() => setInput("What's the model accuracy?")}>
                            📊 Model performance
                        </button>
                        <button className="question-button" onClick={() => setInput("What hospitals are available?")}>
                            🏣 List hospitals
                        </button>
                        <button className="question-button" onClick={() => setInput("What can you help me with?")}>
                            ❓ Help & features
                        </button>
                    </div>

                    {/* Data availability information */}
                    <div className="data-availability-note">
                        <p><strong>Available Data:</strong></p>
                        <p>• Actual: Jan 2020 - Dec 2024</p>
                        <p>• Predicted: Jan 2025 - Dec 2026</p>
                        <p className="data-note-tip">Tip: Try asking about specific hospitals like "Newcastle", "Poole", or "Kettering"</p>
                    </div>
                </div>

                {/* Chat message display area */}
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

            {/* Input area for user messages */}
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