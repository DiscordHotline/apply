module.exports = function authenticationMiddleware(...scopes) {
    return function(req, res, next) {
        if (req.isAuthenticated()) {
            return next()
        }

        if (req.session) {
            req.session.lastUrl = req.originalUrl;
        }

        if (!scopes) {
            res.redirect('/connect');
        } else {
            console.log(scopes)
            res.redirect('/connect?scopes=' + scopes.join(','))
        }
    }
};
