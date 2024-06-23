/**
 * This is an example middleware that checks if the user is logged in.
 *
 * If the user is not logged in, it stores the requested url in `returnTo` attribute
 * and then redirects to `/login`.
 *
 */
module.exports = {
    isAuth: (req, res, next) => {
        if (req.isAuthenticated()) {
            next();
        } else {
            req.session.returnTo = req.originalUrl;
            res.redirect('/login');
        }
    },
    isNotAuth: (req, res, next) => {
        if (!req.isAuthenticated()) {
            next();
        } else {
            res.redirect('/success');
        }
    }
};