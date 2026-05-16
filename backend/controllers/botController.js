const Bot = require('../models/Bot');
const { generateSetupDraft } = require('../services/aiService');
const {
    isValidBotId,
    isValidDomain,
    isValidHttpUrl,
    normalizeDomain
} = require('../utils/security');

const FIELD_LIMITS = {
    botName: 120,
    assistantRole: 80,
    languageStyle: 80,
    tone: 80,
    welcomeMessage: 500,
    systemContext: 4000,
    advancedInstructions: 2000,
    knowledgeBaseText: 20000,
    avatarImgUrl: 1000
};

const MAX_ALLOWED_DOMAINS = 2;
const STRING_FIELDS = [
    'botName',
    'assistantRole',
    'languageStyle',
    'tone',
    'welcomeMessage',
    'systemContext',
    'advancedInstructions',
    'knowledgeBaseText',
    'primaryColor',
    'avatarImgUrl'
];
const FIELD_LABELS = {
    botName: 'Bot name',
    assistantRole: 'Assistant role',
    languageStyle: 'Language style',
    tone: 'Tone',
    welcomeMessage: 'Opening message',
    systemContext: 'Generated instructions',
    advancedInstructions: 'Advanced instructions',
    knowledgeBaseText: 'Reference data',
    primaryColor: 'Primary color',
    avatarImgUrl: 'Avatar image URL'
};
const REQUIRED_GENERATOR_ANSWERS = [
    ['businessName', 'Business or assistant name'],
    ['primaryPurpose', 'What should this assistant help with'],
    ['offerings', 'Services, products, or topics'],
    ['commonQuestions', 'Common questions people ask'],
    ['contactRoute', 'Human handoff route'],
    ['boundaries', 'Things it should avoid saying']
];

const pickBotPayload = (body) => {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return {};
    }

    const allowedFields = [
        'botName',
        'assistantRole',
        'languageStyle',
        'tone',
        'capabilities',
        'welcomeMessage',
        'systemContext',
        'advancedInstructions',
        'knowledgeBaseText',
        'primaryColor',
        'avatarImgUrl',
        'allowedDomains'
    ];

    const payload = allowedFields.reduce((nextPayload, field) => {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
            nextPayload[field] = body[field];
        }
        return nextPayload;
    }, {});

    STRING_FIELDS.forEach((field) => {
        if (typeof payload[field] === 'string') {
            payload[field] = payload[field].trim();
        }
    });

    if (Array.isArray(payload.allowedDomains)) {
        payload.allowedDomains = [...new Set(
            payload.allowedDomains
                .map(normalizeDomain)
                .filter(Boolean)
        )];
    }

    return payload;
};

const validateBotPayload = (payload, options = {}) => {
    const errors = [];
    const { requireBotName = false, requireKnowledgeBase = false, existingBot = null } = options;

    if (requireBotName && !Object.prototype.hasOwnProperty.call(payload, 'botName')) {
        errors.push('Bot name is required.');
    }

    STRING_FIELDS.forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(payload, field) && typeof payload[field] !== 'string') {
            errors.push(`${FIELD_LABELS[field]} must be text.`);
        }
    });

    if (Object.prototype.hasOwnProperty.call(payload, 'botName')) {
        if (typeof payload.botName !== 'string' || !payload.botName.trim()) {
            errors.push('Bot name is required.');
        } else if (payload.botName.trim().length > FIELD_LIMITS.botName) {
            errors.push(`Bot name must be ${FIELD_LIMITS.botName} characters or fewer.`);
        }
    }

    ['assistantRole', 'languageStyle', 'tone', 'welcomeMessage', 'systemContext', 'advancedInstructions', 'knowledgeBaseText', 'avatarImgUrl'].forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(payload, field)
            && typeof payload[field] === 'string'
            && payload[field].length > FIELD_LIMITS[field]) {
            errors.push(`${FIELD_LABELS[field]} must be ${FIELD_LIMITS[field]} characters or fewer.`);
        }
    });

    if (Object.prototype.hasOwnProperty.call(payload, 'primaryColor')) {
        if (typeof payload.primaryColor !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(payload.primaryColor)) {
            errors.push('Primary color must be a valid 6-digit hex color, for example #2563EB.');
        }
    }

    const hasKnowledgeBaseText = Object.prototype.hasOwnProperty.call(payload, 'knowledgeBaseText');
    const knowledgeBaseText = hasKnowledgeBaseText
        ? payload.knowledgeBaseText
        : existingBot?.knowledgeBaseText;

    if (hasKnowledgeBaseText || requireKnowledgeBase) {
        if (typeof knowledgeBaseText !== 'string' || knowledgeBaseText.trim().length < 20) {
            errors.push('Reference data is required and should include at least 20 characters.');
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'capabilities')) {
        if (!Array.isArray(payload.capabilities)) {
            errors.push('Capabilities must be a list.');
        } else if (payload.capabilities.length > 8) {
            errors.push('Capabilities can include no more than 8 entries.');
        } else if (payload.capabilities.some((capability) => typeof capability !== 'string' || capability.trim().length === 0 || capability.length > 80)) {
            errors.push('Capabilities must be non-empty text values under 80 characters.');
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'avatarImgUrl')) {
        if (payload.avatarImgUrl && !isValidHttpUrl(payload.avatarImgUrl)) {
            errors.push('Avatar image URL must be a valid http or https URL.');
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'allowedDomains')) {
        if (!Array.isArray(payload.allowedDomains)) {
            errors.push('Allowed domains must be a list.');
        } else {
            if (payload.allowedDomains.length > MAX_ALLOWED_DOMAINS) {
                errors.push(`Allowed domains can include no more than ${MAX_ALLOWED_DOMAINS} entries.`);
            }

            payload.allowedDomains.forEach((domain) => {
                if (typeof domain !== 'string' || domain.trim().length === 0 || domain.trim().length > 253 || !isValidDomain(domain.trim())) {
                    errors.push('Allowed domains must be valid domains, for example example.com or localhost.');
                }
            });
        }
    }

    return errors;
};

const validateGeneratorPayload = (body) => {
    const errors = [];
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return ['Generator request must be a JSON object.'];
    }

    const answers = body.answers && typeof body.answers === 'object' ? body.answers : {};
    const missingAnswers = REQUIRED_GENERATOR_ANSWERS
        .filter(([key]) => !String(answers[key] || '').trim())
        .map(([, label]) => label);

    if (missingAnswers.length > 0) {
        errors.push(`Complete every generator question before generating reference data. Missing: ${missingAnswers.join(', ')}.`);
    }

    Object.entries(answers).forEach(([key, value]) => {
        if (String(key).length > 80 || String(value || '').length > 1500) {
            errors.push('Generator answers are too long.');
        }
    });

    ['assistantRole', 'languageStyle', 'tone'].forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(body, field)
            && (typeof body[field] !== 'string' || body[field].trim().length > 120)) {
            errors.push(`${field} must be text under 120 characters.`);
        }
    });

    if (Object.prototype.hasOwnProperty.call(body, 'capabilities')) {
        if (!Array.isArray(body.capabilities)) {
            errors.push('Capabilities must be a list.');
        } else if (body.capabilities.length > 8 || body.capabilities.some((value) => typeof value !== 'string' || value.length > 80)) {
            errors.push('Capabilities must contain short text values.');
        }
    }

    return errors;
};

const sendValidationError = (res, errors) => (
    res.status(400).json({
        message: 'Bot configuration has invalid fields.',
        errors
    })
);

// @desc    Create a new Introducer Bot
// @route   POST /api/bots
// @access  Private
const createBot = async (req, res) => {
    try {
        const payload = pickBotPayload(req.body);
        const validationErrors = validateBotPayload(payload, {
            requireBotName: true,
            requireKnowledgeBase: true
        });

        if (validationErrors.length > 0) {
            return sendValidationError(res, validationErrors);
        }

        const newBot = await Bot.create({
            firebaseUid: req.user.firebaseUid, // From the protect middleware
            ...payload
        });

        res.status(201).json(newBot);
    } catch (error) {
        console.error("Create Bot Error:", error);
        res.status(500).json({ message: "Server error creating bot. Please try again." });
    }
};

// @desc    Get all bots belonging to the logged-in user
// @route   GET /api/bots
// @access  Private
const getBots = async (req, res) => {
    try {
        const bots = await Bot.find({ firebaseUid: req.user.firebaseUid });
        res.status(200).json(bots);
    } catch (error) {
        console.error("Get Bots Error:", error);
        res.status(500).json({ message: "Server error fetching bots. Please refresh and try again." });
    }
};

// @desc    Update a specific bot (e.g. changing color or knowledge base)
// @route   PUT /api/bots/:id
// @access  Private
const updateBot = async (req, res) => {
    try {
        if (!isValidBotId(req.params.id)) {
            return res.status(400).json({ message: "Invalid bot id" });
        }

        const payload = pickBotPayload(req.body);
        const bot = await Bot.findById(req.params.id);

        if (!bot) {
            return res.status(404).json({ message: "Bot not found" });
        }

        // Make sure the logged-in user actually owns this bot!
        if (bot.firebaseUid !== req.user.firebaseUid) {
            return res.status(401).json({ message: "User not authorized to edit this bot" });
        }

        const validationErrors = validateBotPayload(payload, {
            requireKnowledgeBase: true,
            existingBot: bot
        });

        if (validationErrors.length > 0) {
            return sendValidationError(res, validationErrors);
        }

        const updatedBot = await Bot.findByIdAndUpdate(
            req.params.id,
            payload,
            { new: true, runValidators: true } // Return the updated document
        );

        res.status(200).json(updatedBot);
    } catch (error) {
        console.error("Update Bot Error:", error);
        res.status(500).json({ message: "Server error updating bot. Please try again." });
    }
};

// @desc    Delete a bot
// @route   DELETE /api/bots/:id
// @access  Private
const deleteBot = async (req, res) => {
    try {
        if (!isValidBotId(req.params.id)) {
            return res.status(400).json({ message: "Invalid bot id" });
        }

        const bot = await Bot.findById(req.params.id);

        if (!bot) {
            return res.status(404).json({ message: "Bot not found" });
        }

        if (bot.firebaseUid !== req.user.firebaseUid) {
            return res.status(401).json({ message: "User not authorized to delete this bot" });
        }

        await bot.deleteOne();
        res.status(200).json({ id: req.params.id, message: "Bot deleted successfully" });
    } catch (error) {
        console.error("Delete Bot Error:", error);
        res.status(500).json({ message: "Server error deleting bot. Please try again." });
    }
};

const generateReferenceDraft = async (req, res) => {
    try {
        const validationErrors = validateGeneratorPayload(req.body);

        if (validationErrors.length > 0) {
            return sendValidationError(res, validationErrors);
        }

        const draft = await generateSetupDraft({
            assistantRole: req.body.assistantRole,
            languageStyle: req.body.languageStyle,
            tone: req.body.tone,
            capabilities: Array.isArray(req.body.capabilities) ? req.body.capabilities : [],
            answers: req.body.answers || {}
        });

        res.status(200).json({
            message: draft.source === 'fallback'
                ? 'Generated a local draft because AI providers were unavailable.'
                : `Generated reference data with ${draft.source}.`,
            ...draft
        });
    } catch (error) {
        console.error("Generate Reference Draft Error:", error);
        res.status(500).json({ message: "Could not generate reference data. Please try again." });
    }
};

module.exports = {
    createBot,
    getBots,
    updateBot,
    deleteBot,
    generateReferenceDraft
};
