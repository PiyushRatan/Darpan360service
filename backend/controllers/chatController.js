const Bot = require('../models/Bot');
const ChatSession = require('../models/ChatSession');
const { getAiResponse } = require('../services/aiService');

const handleIncomingChat = async (req, res) => {
    try {
        const { botId } = req.params;
        const { message, clientSessionId } = req.body;

        if (!message || !clientSessionId) {
            return res.status(400).json({ error: "Missing message or clientSessionId" });
        }

        // 1. Fetch the requested Bot configuration from MongoDB
        const bot = await Bot.findById(botId);
        if (!bot) {
            return res.status(404).json({ error: "Bot not found" });
        }

        // CORS / Domain Whitelist Security Check happens in middleware, so we can trust the request here

        // 2. Locate or Create the Chat Session tracking this specific user
        let session = await ChatSession.findOne({ botId, clientSessionId });
        
        if (!session) {
            session = await ChatSession.create({
                botId,
                clientSessionId,
                messages: []
            });
        }

        // 3. Prepare the history array for the AI API
        const history = session.messages.map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // Push the new user message into the MongoDB thread
        session.messages.push({ role: 'user', content: message });
        
        // 4. Send to the Smart Rotator Engine (Abstracting API limits)
        let aiTextResponse;
        try {
            aiTextResponse = await getAiResponse(bot, history, message);
        } catch (aiError) {
            return res.status(503).json({ 
                error: "The AI is currently resting. Please try again in 10 seconds.",
                details: aiError.message 
            });
        }

        // 5. Append the AI response to the Session History and Save
        session.messages.push({ role: 'model', content: aiTextResponse });
        await session.save();

        // 6. Return response to widget
        res.status(200).json({
            response: aiTextResponse,
            botName: bot.botName,
            avatarImgUrl: bot.avatarImgUrl,
            primaryColor: bot.primaryColor
        });

    } catch (error) {
        console.error("Chat Controller Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getBotConfig = async (req, res) => {
    try {
        const { botId } = req.params;
        const bot = await Bot.findById(botId);
        if (!bot) {
            return res.status(404).json({ error: "Bot not found" });
        }
        res.status(200).json({
            botName: bot.botName,
            primaryColor: bot.primaryColor,
            avatarImgUrl: bot.avatarImgUrl,
            allowedDomains: bot.allowedDomains
        });
    } catch (error) {
        console.error("Config Fetch Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
const getChatHistory = async (req, res) => {
    try {
        const { botId, clientSessionId } = req.params;
        const session = await ChatSession.findOne({ botId, clientSessionId });
        
        if (!session) {
            // New user, return empty history gracefully
            return res.status(200).json({ messages: [] });
        }
        return res.status(200).json({ messages: session.messages });
    } catch (error) {
        console.error("History Fetch Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { handleIncomingChat, getBotConfig, getChatHistory };
