const Bot = require('../models/Bot');

// @desc    Create a new Introducer Bot
// @route   POST /api/bots
// @access  Private
const createBot = async (req, res) => {
    try {
        const { botName, welcomeMessage, systemContext, knowledgeBaseText, primaryColor, avatarImgUrl, allowedDomains } = req.body;

        const newBot = await Bot.create({
            firebaseUid: req.user.firebaseUid, // From the protect middleware
            botName,
            welcomeMessage,
            systemContext,
            knowledgeBaseText,
            primaryColor,
            avatarImgUrl,
            allowedDomains
        });

        res.status(201).json(newBot);
    } catch (error) {
        console.error("Create Bot Error:", error);
        res.status(500).json({ message: "Server Error creating bot" });
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
        res.status(500).json({ message: "Server Error fetching bots" });
    }
};

// @desc    Update a specific bot (e.g. changing color or knowledge base)
// @route   PUT /api/bots/:id
// @access  Private
const updateBot = async (req, res) => {
    try {
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
            req.body,
            { new: true } // Return the updated document
        );

        res.status(200).json(updatedBot);
    } catch (error) {
        console.error("Update Bot Error:", error);
        res.status(500).json({ message: "Server Error updating bot" });
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
        res.status(500).json({ message: "Server Error deleting bot" });
    }
};

module.exports = {
    createBot,
    getBots,
    updateBot,
    deleteBot
};
