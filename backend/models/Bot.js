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
        type: String, // Short behavioral context
        default: 'You are a helpful assistant.'
    },
    knowledgeBaseText: {
        type: String, // Massive dump of FAQ/Business info
        default: ''
    },
    primaryColor: {
        type: String,
        default: '#1E1E1E' // Default to our Builder Dark motif!
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
