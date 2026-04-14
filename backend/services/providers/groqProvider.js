const Groq = require('groq-sdk');

/**
 * Handles communication with the Groq API (Llama 3 8b/70b).
 * This Provider acts as the ultimate low-latency secondary fallback to Gemini.
 */
const generateGroqResponse = async (apiKey, fullContext, history, newMessage) => {
    const groq = new Groq({ apiKey });

    // Map our generic { role: 'user' | 'model', content: '' } to Groq's OpenAI-like format
    const formattedHistory = history.map(msg => ({
        role: msg.role === 'model' ? 'assistant' : 'user',
        content: msg.content
    }));

    // Inject system context at the very top
    const messages = [
        { role: 'system', content: fullContext },
        ...formattedHistory,
        { role: 'user', content: newMessage }
    ];

    const chatCompletion = await groq.chat.completions.create({
        messages,
        model: "llama3-8b-8192", // Exceptionally fast, massive 8k window
    });

    return chatCompletion.choices[0]?.message?.content || "";
};

module.exports = { generateGroqResponse };
