const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDb = require('./config/dbConnection');
const Bot = require('./models/Bot');

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDb();

const app = express();

// Middleware
app.use(express.json());

// Strict Dynamic CORS Policy
const corsOptionsDelegate = async (req, callback) => {
    let isDomainAllowed = false;
    const origin = req.header('Origin');
    
    // 1. Allow if no origin (e.g., Postman, curl, server-to-server)
    if (!origin) {
        return callback(null, { origin: true });
    }

    // 2. Always allow the main frontend platform
    const mainFrontend = process.env.FRONTEND_URL || 'https://darpan360.in';
    const localhostPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+/;

    if (origin === mainFrontend || localhostPattern.test(origin)) {
        isDomainAllowed = true;
    } else {
        // 3. For chatbot widget routes, check specific Bot's allowedDomains
        const chatMatch = req.originalUrl.match(/^\/api\/chat\/([a-fA-F0-9]{24})/);
        if (chatMatch) {
            const botId = chatMatch[1];
            try {
                const bot = await Bot.findById(botId, 'allowedDomains');
                if (bot && bot.allowedDomains && bot.allowedDomains.length > 0) {
                    try {
                        const originHostname = new URL(origin).hostname;
                        isDomainAllowed = bot.allowedDomains.some(domain => {
                            const cleanDomain = domain.trim().toLowerCase();
                            return originHostname === cleanDomain || origin.includes(cleanDomain);
                        });
                    } catch (e) {
                         // invalid origin URL fallback
                         isDomainAllowed = bot.allowedDomains.some(domain => origin.includes(domain.trim()));
                    }
                } else if (bot && bot.allowedDomains && bot.allowedDomains.length === 0) {
                    // Empty allowed Domains array implies 'Any Domain' can access this bot
                    isDomainAllowed = true;
                }
            } catch (error) {
                console.error("CORS Bot DB check error:", error);
            }
        }
    }

    if (isDomainAllowed) {
        callback(null, { origin: true });
    } else {
        callback(new Error('Not allowed by strict CORS policy'));
    }
};

app.use(cors(corsOptionsDelegate));

// CORS Error Handler Middleware
app.use((err, req, res, next) => {
    if (err.message === 'Not allowed by strict CORS policy') {
        return res.status(403).json({ error: 'Origin not allowed by strict CORS policy' });
    }
    next(err);
});

// Serve the static widget application files
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// Mount API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/bots', require('./routes/botRoutes'));
app.use('/api/chat', require('./routes/chatRoutes'));

// Initialize background tasks
const { startCronJobs } = require('./services/cronService');
startCronJobs();

// Basic health check route
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API is running' });
});

// Setup Port
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

// Export for Vercel Serverless Architecture
module.exports = app;
