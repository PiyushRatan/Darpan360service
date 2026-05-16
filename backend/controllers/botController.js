const Bot = require('../models/Bot');

const FIELD_LIMITS = {
    botName: 120,
    welcomeMessage: 500,
    systemContext: 4000,
    knowledgeBaseText: 20000,
    avatarImgUrl: 1000
};

const pickBotPayload = (body) => {
    const allowedFields = [
        'botName',
        'welcomeMessage',
        'systemContext',
        'knowledgeBaseText',
        'primaryColor',
        'avatarImgUrl',
        'allowedDomains'
    ];

    return allowedFields.reduce((payload, field) => {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
            payload[field] = body[field];
        }
        return payload;
    }, {});
};

const validateBotPayload = (payload) => {
    const errors = [];

    if (Object.prototype.hasOwnProperty.call(payload, 'botName')) {
        if (typeof payload.botName !== 'string' || !payload.botName.trim()) {
            errors.push('Bot name is required.');
        } else if (payload.botName.trim().length > FIELD_LIMITS.botName) {
            errors.push(`Bot name must be ${FIELD_LIMITS.botName} characters or fewer.`);
        }
    }

    ['welcomeMessage', 'systemContext', 'knowledgeBaseText', 'avatarImgUrl'].forEach((field) => {
        if (Object.prototype.hasOwnProperty.call(payload, field)
            && typeof payload[field] === 'string'
            && payload[field].length > FIELD_LIMITS[field]) {
            errors.push(`${field} must be ${FIELD_LIMITS[field]} characters or fewer.`);
        }
    });

    if (payload.primaryColor && !/^#[0-9a-fA-F]{6}$/.test(payload.primaryColor)) {
        errors.push('Primary color must be a valid 6-digit hex color, for example #2563EB.');
    }

    if (payload.avatarImgUrl && typeof payload.avatarImgUrl === 'string') {
        try {
            new URL(payload.avatarImgUrl);
        } catch (error) {
            errors.push('Avatar image URL must be a valid URL.');
        }
    }

    if (Object.prototype.hasOwnProperty.call(payload, 'allowedDomains')) {
        if (!Array.isArray(payload.allowedDomains)) {
            errors.push('Allowed domains must be a list.');
        } else {
            if (payload.allowedDomains.length > 20) {
                errors.push('Allowed domains can include no more than 20 entries.');
            }

            payload.allowedDomains.forEach((domain) => {
                if (typeof domain !== 'string' || domain.trim().length === 0 || domain.trim().length > 253) {
                    errors.push('Allowed domains must be non-empty domain strings under 253 characters.');
                }
            });
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
        const validationErrors = validateBotPayload(payload);

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
        const payload = pickBotPayload(req.body);
        const validationErrors = validateBotPayload(payload);

        if (validationErrors.length > 0) {
            return sendValidationError(res, validationErrors);
        }

        const bot = await Bot.findById(req.params.id);

        if (!bot) {
            return res.status(404).json({ message: "Bot not found" });
        }

        // Make sure the logged-in user actually owns this bot!
        if (bot.firebaseUid !== req.user.firebaseUid) {
            return res.status(401).json({ message: "User not authorized to edit this bot" });
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

module.exports = {
    createBot,
    getBots,
    updateBot,
    deleteBot
};
