const BOT_ID_PATTERN = /^[A-Za-z0-9_-]{8,128}$/;
const LOCALHOST_ORIGIN_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/;
const DOMAIN_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;
const DEFAULT_PLATFORM_ORIGINS = [
    'https://darpan360.in',
    'https://darpan360ai.web.app',
    'https://darpan360ai.firebaseapp.com'
];

const normalizeHostname = (value) => {
    if (!value || typeof value !== 'string') return '';

    const trimmed = value.trim().toLowerCase();
    if (!trimmed || trimmed === 'null') return '';

    try {
        return new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`).hostname.replace(/^www\./, '');
    } catch (error) {
        return trimmed.split('/')[0].split(':')[0].replace(/^www\./, '');
    }
};

const normalizeOrigin = (value) => {
    if (!value || typeof value !== 'string') return '';

    const trimmed = value.trim();
    if (!trimmed || trimmed === 'null') return '';

    try {
        return new URL(trimmed.includes('://') ? trimmed : `https://${trimmed}`).origin;
    } catch (error) {
        return '';
    }
};

const normalizeDomain = (value) => normalizeHostname(value);

const isValidDomain = (domain) => (
    domain === 'localhost'
    || DOMAIN_PATTERN.test(domain)
);

const isValidBotId = (botId) => (
    typeof botId === 'string'
    && BOT_ID_PATTERN.test(botId)
);

const isValidHttpUrl = (value) => {
    if (typeof value !== 'string' || !value.trim()) return false;

    try {
        const parsed = new URL(value.trim());
        return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch (error) {
        return false;
    }
};

const isAllowedHostname = (originHostname, allowedDomain) => {
    const hostname = normalizeHostname(originHostname);
    const domain = normalizeDomain(allowedDomain);

    if (!hostname || !domain) return false;
    return hostname === domain || hostname.endsWith(`.${domain}`);
};

const getConfiguredOrigins = () => (
    [
        ...DEFAULT_PLATFORM_ORIGINS,
        ...(process.env.FRONTEND_URL || '')
            .split(',')
    ]
        .map(normalizeOrigin)
        .filter((origin) => (
            origin
            && (
                process.env.NODE_ENV !== 'production'
                || !LOCALHOST_ORIGIN_PATTERN.test(origin)
            )
        ))
);

const isPlatformOrigin = (origin) => {
    const normalizedOrigin = normalizeOrigin(origin);
    if (!normalizedOrigin) return false;

    if (getConfiguredOrigins().includes(normalizedOrigin)) {
        return true;
    }

    return process.env.NODE_ENV !== 'production'
        && LOCALHOST_ORIGIN_PATTERN.test(normalizedOrigin);
};

const getRequestSourceOrigin = (req) => {
    const rawSourceOrigin = req.body?.sourceOrigin
        || req.query?.sourceOrigin
        || req.header('X-Darpan-Source-Origin')
        || req.header('Origin');

    return normalizeOrigin(rawSourceOrigin);
};

const getAllowedDomains = (bot) => (
    Array.isArray(bot?.allowedDomains)
        ? bot.allowedDomains
            .map(normalizeDomain)
            .filter(Boolean)
            .slice(0, 2)
        : []
);

const validateBotSource = (bot, sourceOrigin) => {
    const allowedDomains = getAllowedDomains(bot);
    const normalizedSourceOrigin = normalizeOrigin(sourceOrigin);
    const sourceHostname = normalizeHostname(normalizedSourceOrigin);

    if (!normalizedSourceOrigin || !sourceHostname) {
        return {
            allowed: false,
            error: 'This chatbot is restricted to approved websites. Open it from an allowed domain.'
        };
    }

    if (isPlatformOrigin(normalizedSourceOrigin)) {
        return { allowed: true };
    }

    if (allowedDomains.length === 0) {
        return {
            allowed: false,
            error: 'This chatbot is only approved on Darpan360 until a website domain is added in bot settings.'
        };
    }

    const allowed = allowedDomains.some((domain) => isAllowedHostname(sourceHostname, domain));

    return {
        allowed,
        error: allowed
            ? null
            : 'This chatbot is not approved for this website. Add this domain in the bot settings before using the widget here.'
    };
};

module.exports = {
    getAllowedDomains,
    getConfiguredOrigins,
    getRequestSourceOrigin,
    isAllowedHostname,
    isPlatformOrigin,
    isValidBotId,
    isValidDomain,
    isValidHttpUrl,
    normalizeDomain,
    normalizeHostname,
    normalizeOrigin,
    validateBotSource
};
