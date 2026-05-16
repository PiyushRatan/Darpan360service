const admin = require('../config/firebaseAdmin');

const db = admin.firestore();
const bots = db.collection('bots');

const DEFAULT_BOT = {
    botName: 'Darpan360 Assistant',
    welcomeMessage: 'Hello! I am the AI Assistant. How can I help you today?',
    systemContext: 'You are a helpful assistant.',
    knowledgeBaseText: '',
    primaryColor: '#1E1E1E',
    avatarImgUrl: '',
    allowedDomains: []
};

const fromDoc = (doc) => {
    if (!doc.exists) return null;

    return {
        _id: doc.id,
        deleteOne: async () => doc.ref.delete(),
        ...doc.data()
    };
};

const cleanString = (value, fallback, maxLength) => {
    if (typeof value !== 'string') return fallback;
    return value.trim().slice(0, maxLength);
};

const normalizeBot = (payload, existing = {}) => {
    const source = {
        ...DEFAULT_BOT,
        ...existing,
        ...payload
    };

    const allowedDomains = Array.isArray(source.allowedDomains)
        ? source.allowedDomains
            .filter((domain) => typeof domain === 'string')
            .map((domain) => domain.trim())
            .filter(Boolean)
            .slice(0, 20)
        : [];

    const primaryColor = /^#[0-9a-fA-F]{6}$/.test(source.primaryColor)
        ? source.primaryColor
        : DEFAULT_BOT.primaryColor;

    return {
        firebaseUid: source.firebaseUid,
        botName: cleanString(source.botName, DEFAULT_BOT.botName, 120),
        welcomeMessage: cleanString(source.welcomeMessage, DEFAULT_BOT.welcomeMessage, 500),
        systemContext: cleanString(source.systemContext, DEFAULT_BOT.systemContext, 4000),
        knowledgeBaseText: cleanString(source.knowledgeBaseText, DEFAULT_BOT.knowledgeBaseText, 20000),
        primaryColor,
        avatarImgUrl: cleanString(source.avatarImgUrl, DEFAULT_BOT.avatarImgUrl, 1000),
        allowedDomains
    };
};

const Bot = {
    async create(payload) {
        if (!payload.firebaseUid) {
            throw new Error('firebaseUid is required to create a bot');
        }

        const now = new Date();
        const ref = bots.doc();
        await ref.set({
            ...normalizeBot(payload),
            createdAt: now,
            updatedAt: now
        });

        return fromDoc(await ref.get());
    },

    async find(query) {
        let ref = bots;

        if (query.firebaseUid) {
            ref = ref.where('firebaseUid', '==', query.firebaseUid);
        }

        const snapshot = await ref.get();
        return snapshot.docs.map(fromDoc);
    },

    async findById(id) {
        if (!id) return null;
        return fromDoc(await bots.doc(id).get());
    },

    async findByIdAndUpdate(id, payload) {
        const ref = bots.doc(id);
        const existing = await ref.get();

        if (!existing.exists) return null;

        const updated = normalizeBot(payload, existing.data());
        await ref.update({
            ...updated,
            updatedAt: new Date()
        });

        return fromDoc(await ref.get());
    }
};

module.exports = Bot;
