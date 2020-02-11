const router = require('express').Router();
const querystring = require('querystring');
const request = require('request');
const { isAuthorized, storage } = require('../../session');

router.get('/', isAuthorized, (req, res) => {

    const sess = req.session;
    
    if (!req.session.user.spotify) {
        const requestUri = `http://localhost:5000/login`;
        const redirectUri = `http://localhost:3000/connect`;

        const data = {
            redirectUri,
            email: req.session.user.email,
            token: req.session.wa.token
        };
        storage.setItem(req.session.wa.token, JSON.stringify({
            wa: req.session.wa,
            user: req.session.user
        }));
        res.redirect(requestUri + '?' + querystring.stringify(data));
    } else {
        res.redirect('/');
    }
});

router.post('/', isAuthorized, (req, res) => {
    var token = req.body.spotify.token;
    const refresh_token = req.body.spotify.refresh_token;
    req.session.user.spotify = { token, refresh_token };

    const sess = req.session;
    request.get("http://localhost:5000/get-me",{
        json: { token }
    }, (req, response) => {
        sess.user.spotify.id = response.body.id;
        sess.user.spotify.href = response.body.href;
        sess.user.spotify.name = response.body.diplay_name;
        sess.user.spotify.picture = response.body.picture;

        storage.setItem(sess.wa.token, JSON.stringify({
            wa: sess.wa,
            user: sess.user
        }));
        res.end();
    });


    const requestUri = `http://localhost:4000/update-spotify-token`;
    
    request.put(requestUri, {
        json: {
            spotify_token: req.session.user.spotify.refresh_token,
            user_token: req.session.wa.token
        }
    });
    
});

router.post('/token', (req, res) => {

    const requestUri = `http://localhost:5000/token`;
    const refresh_token = req.body.refresh_token;

    request.post(requestUri, {
        json: { refresh_token }
    }, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            const token = body.access_token;
            if (token) {
                res.json({ token });
            }
        } else {
            res.sendStatus(500);
        }
    });
});

module.exports = router;