const session        = require('express-session');
const passport       = require('passport');
const request        = require('request');
const OAuth2Strategy = require('passport-oauth2').Strategy;
const DynamoDBStore  = require('connect-dynamodb')({session});

const cookie = {maxAge: 1000 * 60 * 60 * 24 * 30 * 3};
if (process.env.NODE_ENV === 'prod') {
    cookie.domain = '.hotline.gg';
    cookie.secure = true;
}
const store = new DynamoDBStore({table: process.env.SESSION_TABLE});
const url   = process.env.IS_OFFLINE ? 'http://localhost:3000' : 'https://apply.hotline.gg';

module.exports = (app) => {
    app.use(session({
        secret:            '9a7sd79asrh99a9',
        saveUninitialized: true,
        resave:            false,
        rolling:           true,
        cookie,
        store,
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    const baseUrl  = `https://discordapp.com/api`;
    const authType = `discord`;

    // Passport Initialization
    passport.use(authType, new OAuth2Strategy(
        {
            authorizationURL: `${baseUrl}/oauth2/authorize`,
            tokenURL:         `${baseUrl}/oauth2/token`,
            clientID:         process.secrets.discord.client_id,
            clientSecret:     process.secrets.discord.secret,
            callbackURL:      url + '/connect/callback',
        },
        function (accessToken, refreshToken, empty, cb) {
            request.get(
                `${baseUrl}/users/@me`, {
                    headers: {
                        Authorization: 'Bearer ' + accessToken,
                    },
                },
                function (err, response, body) {
                    if (err) {
                        console.error(err);

                        return cb(err);
                    }

                    const profile        = JSON.parse(body);
                    profile.accessToken  = accessToken;
                    profile.refreshToken = refreshToken;

                    cb(undefined, profile);
                },
            );
        },
    ));

    app.get(`/connect`, passport.authenticate(authType, {scope: ['identify']}));
    app.get(
        `/connect/callback`,
        (req, res) => passport.authenticate(authType, (err, user) => {
            if (err) {
                console.error(err);

                return res.statusCode(500).send(err.message);
            }

            req.logIn(user, err => {
                if (err) {
                    console.error(err);

                    return res.statusCode(500).send(err.message);
                }

                res.redirect(url);
            });
        })(req, res),
    );

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((user, done) => done(null, user));
};
