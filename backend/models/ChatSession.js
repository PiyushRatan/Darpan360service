const admin = require('../config/firebaseAdmin');

const db = admin.firestore();
const chatSessions = db.collection('chatSessions');

const sessionIdFor = (botId, clientSessionId) => `${botId}_${clientSessionId}`;

const normalizeMessage = (message) => ({
    role: ['user', 'model', 'system'].includes(message.role) ? message.role : 'user',
    content: String(message.content || '').slice(0, 8000),
    timestamp: message.timestamp || new Date()
});

const fromDoc = (doc) => {
    if (!doc.exists) return null;

    const data = doc.data();

    return {
        _id: doc.id,
        ...data,
        messages: Array.isArray(data.messages) ? data.messages : [],
        async save() {
            const messages = this.messages.map(normalizeMessage);
            await doc.ref.set({
                botId: this.botId,
                clientSessionId: this.clientSessionId,
                messages,
                updatedAt: new Date()
            }, { merge: true });
            this.messages = messages;
            return this;
        }
    };
};

const ChatSession = {
    async findOne(query) {
        if (!query.botId || !query.clientSessionId) return null;

        const doc = await chatSessions.doc(sessionIdFor(query.botId, query.clientSessionId)).get();
        return fromDoc(doc);
    },

    async create(payload) {
        if (!payload.botId || !payload.clientSessionId) {
            throw new Error('botId and clientSessionId are required to create a chat session');
        }

        const now = new Date();
        const ref = chatSessions.doc(sessionIdFor(payload.botId, payload.clientSessionId));
        await ref.set({
            botId: payload.botId,
            clientSessionId: payload.clientSessionId,
            messages: Array.isArray(payload.messages) ? payload.messages.map(normalizeMessage) : [],
            createdAt: now,
            updatedAt: now
        });

        return fromDoc(await ref.get());
    },

    async deleteMany(query) {
        const cutoff = query?.updatedAt?.$lt;
        let ref = chatSessions;

        if (cutoff) {
            ref = ref.where('updatedAt', '<', cutoff);
        }

        const snapshot = await ref.get();
        const batch = db.batch();

        snapshot.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();

        return { deletedCount: snapshot.size };
    }
};

module.exports = ChatSession;
