const admin = require('../config/firebaseAdmin');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header (Format: "Bearer eyJhbGciOiJSUzI1...")
            token = req.headers.authorization.split(' ')[1];

            // Verify token using Firebase Admin
            const decodedToken = await admin.auth().verifyIdToken(token);

            // Fetch the user from our MongoDB database using the verified Firebase UID
            // We do this so we can attach their MongoDB role (e.g., admin) to the request!
            req.user = await User.findOne({ firebaseUid: decodedToken.uid });

            if (!req.user) {
                // If they logged into Firebase for the first time, our DB might not have them yet.
                // We handle this edge case in the Auth Controller!
                req.firebaseUser = decodedToken; 
            }

            next();
        } catch (error) {
            console.error("Auth Middleware Error:", error.message);
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
    }
};

// Middleware specifically for Admin-only routes
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, adminOnly };
