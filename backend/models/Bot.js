const mongoose = require('mongoose');

const botSchema = mongoose.Schema({
    firebaseUid: {
        type: String,
        required: [true, 'Owner UID is required']
    },
    botName: {
        type: String,
        required: [true, 'Bot name is required'],
        default: 'Darpan360 Assistant'
    },
    welcomeMessage: {
        type: String,
        default: 'Hello! I am the AI Assistant. How can I help you today?'
    },
    systemContext: {
        type: String, // System prompt that defines the assistant's behavior
        default: 'You are a helpful assistant.'
    },
    knowledgeBaseText: {
        type: String, // Contextual knowledge data for the bot
        default: ''
    },
    primaryColor: {
        type: String,
        default: '#1E1E1E' // Default widget theme color
    },
    avatarImgUrl: {
        type: String,
        default: ''
    },
    allowedDomains: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Bot', botSchema);
