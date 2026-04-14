const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * Sends a message to the Gemini API.
 * @param {string} apiKey - The specific API key injected by the Smart Rotator
 * @param {string} systemContext - The Bot's personality/knowledge base
 * @param {Array} history - Array of previous messages [{role, content}]
 * @param {string} newMessage - The raw user message
 */
const generateGeminiResponse = async (apiKey, systemContext, history, newMessage) => {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // We use gemini-2.5-flash-lite as it is extremely fast and has a high free-tier rate limit
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.5-flash-lite",
        systemInstruction: systemContext
    });

    // Convert our generic history array into the exact format Gemini expects
    const formattedHistory = history.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user', // Gemini expects 'user' or 'model'
        parts: [{ text: msg.content }]
    }));

    const chat = model.startChat({
        history: formattedHistory,
    });

    const result = await chat.sendMessage(newMessage);
    return result.response.text();
};

module.exports = { generateGeminiResponse };
