const admin = require('../config/firebaseAdmin');

const db = admin.firestore();
const users = db.collection('users');

const fromDoc = (doc) => {
    if (!doc.exists) return null;
    return {
        _id: doc.id,
        ...doc.data()
    };
};

const User = {
    async findOne(query) {
        if (query.firebaseUid) {
            const doc = await users.doc(query.firebaseUid).get();
            return fromDoc(doc);
        }

        if (query.email) {
            const snapshot = await users.where('email', '==', query.email).limit(1).get();
            return snapshot.empty ? null : fromDoc(snapshot.docs[0]);
        }

        return null;
    },

    async countDocuments() {
        const snapshot = await users.limit(1).get();
        return snapshot.empty ? 0 : 1;
    },

    async findOneAndUpdate(query, update) {
        if (!query.firebaseUid) {
            throw new Error('firebaseUid is required to sync a user');
        }

        const now = new Date();
        const ref = users.doc(query.firebaseUid);
        const existing = await ref.get();

        if (!existing.exists) {
            await ref.set({
                ...update.$setOnInsert,
                createdAt: now,
                updatedAt: now
            });
        } else {
            await ref.update({ updatedAt: now });
        }

        return fromDoc(await ref.get());
    }
};

module.exports = User;
