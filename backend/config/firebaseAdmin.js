const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const normalizePrivateKey = (privateKey) => {
    if (!privateKey) return privateKey;

    return privateKey
        .trim()
        .replace(/^["']|["']$/g, '')
        .replace(/\\n/g, '\n');
};

const looksLikePlaceholder = (value) => (
    !value || /your_|placeholder|paste_|<.*>/i.test(value)
);

const getServiceAccount = () => {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        const serviceAccountPath = path.resolve(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
        if (fs.existsSync(serviceAccountPath)) {
            const serviceAccount = require(serviceAccountPath);
            return {
                ...serviceAccount,
                private_key: normalizePrivateKey(serviceAccount.private_key)
            };
        }
    }

    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        return {
            ...serviceAccount,
            private_key: normalizePrivateKey(serviceAccount.private_key)
        };
    }

    const requiredKeys = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_PRIVATE_KEY'
    ];
    const missingKeys = requiredKeys.filter((key) => !process.env[key]);

    if (missingKeys.length > 0) {
        throw new Error(`Missing Firebase Admin env vars: ${missingKeys.join(', ')}`);
    }

    const privateKey = normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    if (looksLikePlaceholder(process.env.FIREBASE_PROJECT_ID)
        || looksLikePlaceholder(process.env.FIREBASE_CLIENT_EMAIL)
        || looksLikePlaceholder(privateKey)) {
        throw new Error('Firebase Admin env vars contain placeholder values. Replace them with a Firebase service account key.');
    }

    return {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey
    };
};

if (!admin.apps.length) {
    const appOptions = {
        credential: admin.credential.cert(getServiceAccount())
    };

    if (process.env.FIREBASE_DATABASE_URL) {
        appOptions.databaseURL = process.env.FIREBASE_DATABASE_URL;
    }

    admin.initializeApp(appOptions);

    console.log('Firebase Admin initialized');
}

module.exports = admin;
