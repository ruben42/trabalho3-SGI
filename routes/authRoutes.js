const passport = require('passport');
const router = require('express').Router();
const { isAuth, isNotAuth } = require('../services/middleware');
const User = require('../models/User');
const base64url = require('base64url');
const crypto = require('crypto');

// Home page route
router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/success');
    } else {
        let date = new Intl.DateTimeFormat('en-GB', {
            dateStyle: 'full',
            timeStyle: 'long'
        }).format(new Date());
        // Define 'user' object to avoid 'user is not defined' error in index.ejs
        const user = req.user || { publicKey: '' }; // Set an empty object if the user is not authenticated
        res.render('index', {
            date_tag: date,
            message_tag: 'Access your Google Account',
            showPasskeyOption: true, // Add this variable to show the passkey option
            user: user.publicKey // Pass the 'user' object to the index.ejs file 
        });
    }
});

// Redirect home route
router.get('/home'), (req, res) => {
    res.redirect('/');
}

// Success page route
router.get('/success', (req, res) => {
    if (req.isAuthenticated()) {
        console.log("User Authenticated:", req.isAuthenticated());
        console.log('Session expires in:', req.session.cookie.maxAge / 1000);
        res.render('success', {
            message: 'Authorization Successful!',
            user: req.user
        });
    } else {
        console.log("User Not Authenticated \nsessionID:", req.sessionID);
        console.log('Cookie:', req.session.cookie);
        res.redirect('/error');
    }
});

// Protected resource route
router.get('/resource', isAuth, (req, res, next) => {
    res.render('resource', {
        authenticated: req.isAuthenticated()
    });
});

// Status page route
router.get('/status', (req, res, next) => {
    res.render('status', {
        status: req
    });
});

// Error page route
router.get('/error', (req, res) => {
    res.render('error', {
        message_tag: 'Authentication Error'
    });
});

// Logout route
router.get('/logout', (req, res) => {
    console.log("Logging out user:", req.user);
    req.logout((err) => { // Passport logout function
        if (err) {
            console.error("Error during logout:", err);
            return res.redirect('/error');
        }
        req.session.destroy((err) => { // Destroy session
            if (err) {
                console.error("Error destroying session:", err);
                return res.redirect('/error');
            }
            res.clearCookie('connect.sid', { path: '/' }); // Clear session cookie
            console.log("Session destroyed and cookie cleared");
            res.redirect('/'); // Redirect to home page
            console.log("User Authenticated:", req.isAuthenticated());
        });
    });
});

// Google login route
router.get('/login', isNotAuth,
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        accessType: 'offline', // Requests a refresh token
        prompt: 'consent'
    })
);

// Google auth callback route
router.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/error',
        keepSessionInfo: true // Used to keep session info on redirect
    }),
    (req, res) => {
        // Successful authentication, redirect to saved route or success.
        const returnTo = req.session.returnTo;
        delete req.session.returnTo;
        res.redirect(returnTo || '/success');
    });

// PassKey login route (GET)
router.get('/login/passkey', isNotAuth, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id }); // Finds the authenticated user in the collection
        if (user && user.publicKey) {
            const publicKey = user.publicKey;

            // Start the WebAuthn process
            const credential = await navigator.credentials.get({
                publicKey: {
                    challenge: new Uint8Array(32), // Simulate a suitable challenge
                    allowCredentials: [{
                        type: 'public-key',
                        id: Uint8Array.from(atob(publicKey), c => c.charCodeAt(0))
                    }],
                    timeout: 60000 // Timeout for the process
                }
            });

            // Check whether the operation was successful
            if (credential) {
                console.log('WebAuthn login successful:', credential);
                res.redirect('/success');
            } else {
                console.log('WebAuthn login failed');
                res.redirect('/error');
            }
        } else {
            console.error('Public Key not found for the user');
            res.redirect('/error');
        }
    } catch (error) {
        console.error('Error during PassKey login:', error);
        res.redirect('/error');
    }
});

module.exports = router;
