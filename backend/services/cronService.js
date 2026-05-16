const cron = require('node-cron');
const ChatSession = require('../models/ChatSession');
const BotMessageQuota = require('../models/BotMessageQuota');

const startCronJobs = () => {
    cron.schedule('0 * * * *', async () => {
        console.log('[Cron] Starting hourly chat cleanup.');

        try {
            const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);

            const sessionDeletion = await ChatSession.deleteMany({
                updatedAt: { $lt: fourHoursAgo }
            });
            const quotaDeletion = await BotMessageQuota.deleteExpired();

            if (sessionDeletion.deletedCount > 0) {
                console.log(`[Cron] Deleted ${sessionDeletion.deletedCount} inactive chat sessions.`);
            }

            if (quotaDeletion.deletedCount > 0) {
                console.log(`[Cron] Deleted ${quotaDeletion.deletedCount} expired rate-limit records.`);
            }
        } catch (error) {
            console.error('[Cron] Cleanup failed:', error);
        }
    });

    console.log('Cron cleanup initialized.');
};

module.exports = { startCronJobs };
