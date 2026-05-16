const Bot = require('../models/Bot');
const ChatSession = require('../models/ChatSession');
const BotMessageQuota = require('../models/BotMessageQuota');
const { getAiResponse } = require('../services/aiService');
const {
    getRequestSourceOrigin,
    isValidBotId,
    validateBotSource
} = require('../utils/security');

const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_MESSAGES = 20;
const MAX_STORED_MESSAGES = 40;
const SESSION_ID_PATTERN = /^sess_[a-f0-9]{32}$/;

const validateBotAccess = (req, accessConfig) => {
    const sourceOrigin = getRequestSourceOrigin(req);
    const sourceCheck = validateBotSource(accessConfig, sourceOrigin);

    if (!sourceCheck.allowed) {
        return {
            allowed: false,
            status: 403,
            error: sourceCheck.error
        };
    }

    return { allowed: true, sourceOrigin };
};

const cleanChatMessage = (message) => (
    String(message || '')
        .replace(/\u0000/g, '')
        .trim()
);

const getAuthorizedBotAccess = async (req, botId) => {
    const accessConfig = await Bot.findAccessConfigById(botId);

    if (!accessConfig) {
        return {
            allowed: false,
            status: 404,
            error: 'Bot not found'
        };
    }

    const accessCheck = validateBotAccess(req, accessConfig);

    if (!accessCheck.allowed) {
        return accessCheck;
    }

    return {
        allowed: true,
        accessConfig
    };
};

const handleIncomingChat = async (req, res) => {
    try {
        const { botId } = req.params;
        const { message, clientSessionId } = req.body || {};

        if (!isValidBotId(botId)) {
            return res.status(400).json({ error: "Invalid bot id" });
        }

        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            return res.status(400).json({ error: "Invalid chat request body" });
        }

        if (typeof message !== 'string' || typeof clientSessionId !== 'string' || !message.trim() || !clientSessionId) {
            return res.status(400).json({ error: "Missing message or clientSessionId" });
        }

        const cleanMessage = cleanChatMessage(message);

        if (cleanMessage.length > MAX_MESSAGE_LENGTH) {
            return res.status(413).json({ error: `Message is too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.` });
        }

        if (!cleanMessage) {
            return res.status(400).json({ error: "Message cannot be empty." });
        }

        if (!SESSION_ID_PATTERN.test(clientSessionId)) {
            return res.status(400).json({ error: "Invalid clientSessionId" });
        }

        // Only allowed domains can load full bot configuration, sessions, or AI context.
        const accessCheck = await getAuthorizedBotAccess(req, botId);
        if (!accessCheck.allowed) {
            return res.status(accessCheck.status).json({ error: accessCheck.error });
        }

        const bot = await Bot.findById(botId);
        if (!bot) {
            return res.status(404).json({ error: "Bot not found" });
        }

        const quota = await BotMessageQuota.consumeBotMessageQuota(botId);
        if (!quota.allowed) {
            res.setHeader('Retry-After', Math.max(Math.ceil((quota.resetAt.getTime() - Date.now()) / 1000), 1));
            return res.status(429).json({
                error: `This chatbot has reached its ${quota.limit} messages per minute limit. Please try again shortly.`,
                retryAfter: quota.resetAt
            });
        }

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
        const history = session.messages.slice(-MAX_HISTORY_MESSAGES).map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // Push the new user message into the Firebase thread
        session.messages.push({ role: 'user', content: cleanMessage });
        
        // 4. Send to the Smart Rotator Engine (Abstracting API limits)
        let aiTextResponse;
        try {
            aiTextResponse = await getAiResponse(bot, history, cleanMessage);
        } catch (aiError) {
            return res.status(503).json({ 
                error: "The AI is currently resting. Please try again in 10 seconds."
            });
        }

        // 5. Append the AI response to the Session History and Save
        session.messages.push({ role: 'model', content: aiTextResponse });
        if (session.messages.length > MAX_STORED_MESSAGES) {
            session.messages = session.messages.slice(-MAX_STORED_MESSAGES);
        }
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

        if (!isValidBotId(botId)) {
            return res.status(400).json({ error: "Invalid bot id" });
        }

        const accessCheck = await getAuthorizedBotAccess(req, botId);
        if (!accessCheck.allowed) {
            return res.status(accessCheck.status).json({ error: accessCheck.error });
        }

        const bot = await Bot.findById(botId);
        if (!bot) {
            return res.status(404).json({ error: "Bot not found" });
        }

        res.status(200).json({
            botName: bot.botName,
            primaryColor: bot.primaryColor,
            avatarImgUrl: bot.avatarImgUrl,
            welcomeMessage: bot.welcomeMessage
        });
    } catch (error) {
        console.error("Config Fetch Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
const getChatHistory = async (req, res) => {
    try {
        const { botId, clientSessionId } = req.params;

        if (!isValidBotId(botId)) {
            return res.status(400).json({ error: "Invalid bot id" });
        }

        if (!SESSION_ID_PATTERN.test(clientSessionId)) {
            return res.status(400).json({ error: "Invalid clientSessionId" });
        }

        const accessCheck = await getAuthorizedBotAccess(req, botId);
        if (!accessCheck.allowed) {
            return res.status(accessCheck.status).json({ error: accessCheck.error });
        }

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
