require('dotenv').config();
const fs = require('fs');
const path = require('path');

const requiredKeys = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_PRIVATE_KEY'
];

const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    ? path.resolve(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
    : null;
const hasServiceAccountJson = Boolean(process.env.FIREBASE_SERVICE_ACCOUNT);
const hasServiceAccountPath = Boolean(serviceAccountPath);
const usesServiceAccountFile = hasServiceAccountPath && fs.existsSync(serviceAccountPath);
const usesInlineServiceAccount = hasServiceAccountJson;
const usesSplitEnv = !usesServiceAccountFile && !usesInlineServiceAccount;
const missingKeys = usesSplitEnv ? requiredKeys.filter((key) => !process.env[key]) : [];

if (missingKeys.length > 0) {
    console.error(`Missing Firebase Admin env vars: ${missingKeys.join(', ')}`);
    process.exit(1);
}

console.log('Firebase Admin env check');
console.log(`FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID ? 'set' : 'missing'}`);
console.log(`FIREBASE_CLIENT_EMAIL: ${process.env.FIREBASE_CLIENT_EMAIL ? 'set' : 'missing'}`);
console.log(`FIREBASE_DATABASE_URL: ${process.env.FIREBASE_DATABASE_URL ? 'set' : 'missing'}`);
console.log(`FIREBASE_SERVICE_ACCOUNT_PATH: ${process.env.FIREBASE_SERVICE_ACCOUNT_PATH ? 'set' : 'missing'}`);
console.log(`Service account file exists: ${usesServiceAccountFile}`);

if (usesSplitEnv) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.trim().replace(/^["']|["']$/g, '');
    const normalizedPrivateKey = privateKey.replace(/\\n/g, '\n');
    const hasPemHeader = normalizedPrivateKey.includes('-----BEGIN PRIVATE KEY-----');
    const hasPemFooter = normalizedPrivateKey.includes('-----END PRIVATE KEY-----');
    const hasEscapedNewlines = privateKey.includes('\\n');
    const hasPlaceholderValue = /your_|placeholder|paste_|<.*>/i.test([
        process.env.FIREBASE_PROJECT_ID,
        process.env.FIREBASE_CLIENT_EMAIL,
        normalizedPrivateKey
    ].join('\n'));

    console.log(`FIREBASE_PRIVATE_KEY: set`);
    console.log(`Private key has PEM header: ${hasPemHeader}`);
    console.log(`Private key has PEM footer: ${hasPemFooter}`);
    console.log(`Private key uses escaped newlines: ${hasEscapedNewlines}`);
    console.log(`Firebase env contains placeholder text: ${hasPlaceholderValue}`);
}

try {
    require('../config/firebaseAdmin');
    console.log('Firebase Admin SDK check passed');
} catch (error) {
    console.error(`Firebase Admin SDK check failed: ${error.message}`);
    process.exit(1);
}
