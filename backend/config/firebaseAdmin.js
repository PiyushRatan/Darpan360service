const admin = require('firebase-admin');

// We use Environment Variables for the Firebase Service Account so we don't leak keys to GitHub
try {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            // Replace literal \n with actual newlines for the private key to work in .env
            privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
        })
    });
    console.log('Firebase Admin Initialized Successfully');
} catch (error) {
    console.log('Firebase Admin Setup Failed (This is normal if .env is missing keys right now):', error.message);
}

module.exports = admin;
