require('dotenv').config();

const admin = require('../config/firebaseAdmin');

const db = admin.firestore();

const resetFirestore = async () => {
    if (!process.argv.includes('--yes')) {
        console.error('Refusing to reset Firestore without --yes.');
        console.error('Run: npm run firestore:reset -- --yes');
        process.exit(1);
    }

    const collections = await db.listCollections();

    for (const collection of collections) {
        console.log(`Deleting collection: ${collection.id}`);
        await db.recursiveDelete(collection);
    }

    await db.collection('system').doc('metadata').set({
        initializedAt: new Date(),
        storage: 'firestore',
        collections: ['users', 'bots', 'chatSessions']
    });

    console.log('Firestore reset complete.');
};

resetFirestore()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('Firestore reset failed:', error);
        process.exit(1);
    });
