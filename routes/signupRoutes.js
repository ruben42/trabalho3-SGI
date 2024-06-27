const router = require('express').Router();
const { isAuth } = require('../services/middleware');
const User = require('../models/User');
const base64url = require('base64url');

// Route to display the PassKey creation form (Windows Hello)
router.get('/signup', isAuth, (req, res) => {
    // Prepares user data for form pre-filling
    const { displayName, email } = req.user;
    res.render('signup', { displayName, email });
});

// Route to process submission of the PassKey creation form (Windows Hello)
router.post('/signup', isAuth, async (req, res) => {
    try {
        const { email } = req.user;
        const { publicKey } = req.body;

        // Search for the user by email in the database
        let user = await User.findOne({ email });

        if (!user) {
            // If the user does not exist, create a new one
            user = new User({
                displayName: req.user.displayName,
                email: req.user.email,
                publicKey
            });
        } else {
            // If the user already exists, update the publicKey
            user.publicKey = publicKey;
        }

        // Save the publicKey to the user profile
        await user.save();

        // Return the publicKey to be used by the browser (for WebAuthn)
        res.json({ success: true, publicKey });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
