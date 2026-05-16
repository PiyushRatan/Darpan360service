const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const {
    isAllowedHostname,
    isPlatformOrigin,
    normalizeHostname
} = require('./utils/security');

// Load env variables
dotenv.config();

const app = express();
const CHAT_ROUTE_LIMIT_PER_MINUTE = 20;
const AUTH_ROUTE_LIMIT_PER_MINUTE = 60;
const LIMIT_WINDOW_MS = 60 * 1000;

const getRateLimitRetryAfterSeconds = (req) => {
    const resetTime = req.rateLimit?.resetTime;
    if (resetTime instanceof Date) {
        return Math.max(Math.ceil((resetTime.getTime() - Date.now()) / 1000), 1);
    }
    return 60;
};

// Middleware
app.disable('x-powered-by');
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
});
app.use(express.json({ limit: '64kb' }));
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({ error: 'Invalid JSON body.' });
    }
    return next(err);
});

const chatLimiter = rateLimit({
    windowMs: LIMIT_WINDOW_MS,
    limit: CHAT_ROUTE_LIMIT_PER_MINUTE,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (req, res) => {
        const retryAfterSeconds = getRateLimitRetryAfterSeconds(req);
        console.warn(
            `[Route Rate Limit] /api/chat limit hit. ip=${req.ip}; path=${req.originalUrl}; ` +
            `limit=${CHAT_ROUTE_LIMIT_PER_MINUTE}/60s; retryAfter=${retryAfterSeconds}s`
        );
        res.setHeader('Retry-After', retryAfterSeconds);
        res.status(429).json({
            code: 'CHAT_ROUTE_RATE_LIMITED',
            error: `Too many chat requests from this connection. Current limit is ${CHAT_ROUTE_LIMIT_PER_MINUTE} requests per minute. Please try again in ${retryAfterSeconds} seconds.`,
            limit: CHAT_ROUTE_LIMIT_PER_MINUTE,
            windowSeconds: 60,
            retryAfterSeconds
        });
    }
});

const authLimiter = rateLimit({
    windowMs: LIMIT_WINDOW_MS,
    limit: AUTH_ROUTE_LIMIT_PER_MINUTE,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many auth requests. Please try again shortly.' }
});

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
                const bot = await Bot.findAccessConfigById(botId);
                if (bot && bot.allowedDomains && bot.allowedDomains.length > 0) {
                    const originHostname = normalizeHostname(origin);
                    isDomainAllowed = bot.allowedDomains.some(domain => isAllowedHostname(originHostname, domain));
                }
            } catch (error) {
                console.error("CORS Bot DB check error:", error);
            }
        }
    }

    if (isDomainAllowed) {
        callback(null, {
            origin: true,
            credentials: false,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'X-Darpan-Source-Origin']
        });
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
