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
        // Definir o objeto 'user' para evitar o erro 'user is not defined' no index.ejs
        const user = req.user || { publicKey: '' }; // Definir um objeto vazio se o usuário não estiver autenticado
        res.render('index', {
            date_tag: date,
            message_tag: 'Access your Google Account',
            showPasskeyOption: true, // Add this variable to show the passkey option
            user: user.publicKey // Passar o objeto 'user' para o arquivo index.ejs 
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

module.exports = router;