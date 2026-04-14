const cron = require('node-cron');
const ChatSession = require('../models/ChatSession');

/**
 * 🧹 The Grim Reaper Sweeper 🧹
 * Runs every hour to completely eradicate any chat sessions that have been inactive for over 4 hours.
 */
const startCronJobs = () => {
    // Run at minute 0 past every hour (e.g. 1:00, 2:00, 3:00)
    cron.schedule('0 * * * *', async () => {
        console.log('[Cron Sweeper] Commencing 4-Hour Inactivity Pruning Sequence...');
        
        try {
            // Find timestamps exactly 4 hours ago from right now
            const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
            
            // Delete all sessions where the LAST update (last message sent/received) was older than 4 hours
            const deletionResult = await ChatSession.deleteMany({
                updatedAt: { $lt: fourHoursAgo }
            });

            if (deletionResult.deletedCount > 0) {
                console.log(`[Cron Sweeper] Successfully purged ${deletionResult.deletedCount} isolated chat sessions.`);
            } else {
                console.log('[Cron Sweeper] Database is pristine. No abandoned sessions found.');
            }

        } catch (error) {
            console.error('[Cron Sweeper] CRITICAL ERROR during pruning sequence:', error);
        }
    });

    console.log("⏰ Cron Sweeper system initialized (Hourly interval / 4hr threshold).");
};

module.exports = { startCronJobs };
