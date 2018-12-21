module.exports = function authenticationMiddleware() {
    return function(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }

        if (req.session) {
            req.session.lastUrl = req.originalUrl;
        }

        res.redirect('/connect');
    }
};
