const User = require('../models/User');

// @desc    Sync Firebase Auth user to Firestore
// @route   POST /api/auth/sync
// @access  Private (Needs Firebase Token)
const syncUser = async (req, res) => {
    try {
        // req.user might be populated if they existed, OR req.firebaseUser if it's their first time!
        const authPayload = req.user || req.firebaseUser;

        if (!authPayload) {
            return res.status(400).json({ message: "Invalid authentication state." });
        }

        // Standardize variables (req.user has firebaseUid, req.firebaseUser has uid)
        const uid = authPayload.firebaseUid || authPayload.uid;
        const email = authPayload.email;

        // Check if Firestore users are empty before upsert to determine if they get admin
        const isFirstUser = (await User.countDocuments({})) === 0;

        // Atomic Upsert: if firebaseUid exists, return it, otherwise insert it.
        const syncedUser = await User.findOneAndUpdate(
            { firebaseUid: uid },
            {
                $setOnInsert: {
                    firebaseUid: uid,
                    email: email,
                    role: isFirstUser ? 'admin' : 'user'
                }
            },
            { new: true, upsert: true }
        );

        return res.status(200).json({
            _id: syncedUser._id,
            email: syncedUser.email,
            role: syncedUser.role,
            message: "User successfully synced"
        });

    } catch (error) {
        console.error("Sync User Error:", error);
        res.status(500).json({ error: "Failed to sync user data" });
    }
};

module.exports = { syncUser };
