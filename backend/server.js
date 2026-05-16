const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// Load env variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '64kb' }));

const chatLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many chat requests. Please slow down and try again shortly.' }
});

const authLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 60,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many auth requests. Please try again shortly.' }
});

const normalizeHostname = (value) => {
    if (!value || typeof value !== 'string') return '';

    const trimmed = value.trim().toLowerCase();
    if (!trimmed) return '';

    try {
        return new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`).hostname.replace(/^www\./, '');
    } catch (error) {
        return trimmed.split('/')[0].split(':')[0].replace(/^www\./, '');
    }
};

const isAllowedHostname = (originHostname, allowedDomain) => {
    const hostname = normalizeHostname(originHostname);
    const domain = normalizeHostname(allowedDomain);

    if (!hostname || !domain) return false;
    return hostname === domain || hostname.endsWith(`.${domain}`);
};

const configuredOrigins = (process.env.FRONTEND_URL || 'https://darpan360.in')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const isPlatformOrigin = (origin) => {
    const localhostPattern = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/;
    return configuredOrigins.includes(origin) || localhostPattern.test(origin);
};

// Strict Dynamic CORS Policy
const corsOptionsDelegate = async (req, callback) => {
    let isDomainAllowed = false;
    const origin = req.header('Origin');
    
    // 1. Allow if no origin for non-widget routes (e.g., Postman, curl, server-to-server)
    if (!origin) {
        if (req.originalUrl.startsWith('/api/chat')) {
            return callback(new Error('Not allowed by strict CORS policy'));
        }
        return callback(null, { origin: true });
    }

    // 2. Always allow the main frontend platform
    if (isPlatformOrigin(origin)) {
        isDomainAllowed = true;
    } else {
        // 3. For chatbot widget routes, check specific Bot's allowedDomains
        const chatMatch = req.originalUrl.match(/^\/api\/chat\/([^/]+)/);
        if (chatMatch) {
            const botId = chatMatch[1];
            try {
                const Bot = require('./models/Bot');
                const bot = await Bot.findById(botId, 'allowedDomains');
                if (bot && bot.allowedDomains && bot.allowedDomains.length > 0) {
                    const originHostname = normalizeHostname(origin);
                    isDomainAllowed = bot.allowedDomains.some(domain => isAllowedHostname(originHostname, domain));
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
app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/bots', require('./routes/botRoutes'));
app.use('/api/chat', chatLimiter, require('./routes/chatRoutes'));

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
