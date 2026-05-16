const admin = require('../config/firebaseAdmin');

const db = admin.firestore();
const botRateLimits = db.collection('botMessageRateLimits');

const DEFAULT_LIMIT = 10;
const WINDOW_MS = 60 * 1000;
const CLEANUP_AFTER_MS = 10 * WINDOW_MS;

const getLimit = () => {
    const configuredLimit = Number(process.env.BOT_MESSAGE_LIMIT_PER_MINUTE);
    return Number.isFinite(configuredLimit) && configuredLimit > 0
        ? Math.floor(configuredLimit)
        : DEFAULT_LIMIT;
};

const getWindowStart = (date = new Date()) => (
    Math.floor(date.getTime() / WINDOW_MS) * WINDOW_MS
);

const consumeBotMessageQuota = async (botId, now = new Date()) => {
    const limit = getLimit();
    const windowStartMs = getWindowStart(now);
    const resetAt = new Date(windowStartMs + WINDOW_MS);
    const ref = botRateLimits.doc(`${botId}_${windowStartMs}`);

    return db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(ref);
        const count = snapshot.exists ? Number(snapshot.data().count || 0) : 0;

        if (count >= limit) {
            return {
                allowed: false,
                limit,
                remaining: 0,
                resetAt
            };
        }

        transaction.set(ref, {
            botId,
            count: count + 1,
            limit,
            windowStart: new Date(windowStartMs),
            resetAt,
            expiresAt: new Date(windowStartMs + CLEANUP_AFTER_MS),
            updatedAt: now
        }, { merge: true });

        return {
            allowed: true,
            limit,
            remaining: Math.max(limit - count - 1, 0),
            resetAt
        };
    });
};

const deleteExpired = async (now = new Date()) => {
    const snapshot = await botRateLimits
        .where('expiresAt', '<', now)
        .limit(500)
        .get();

    if (snapshot.empty) {
        return { deletedCount: 0 };
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();

    return { deletedCount: snapshot.size };
};

module.exports = {
    consumeBotMessageQuota,
    deleteExpired
};
