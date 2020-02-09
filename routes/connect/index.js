const router = require('express').Router();
const querystring = require('querystring');
const request = require('request');
const { isAuthorized, storage } = require('../../session');

router.get('/', isAuthorized, (req, res) => {

    const sess = req.session;
    // console.log("connect")
    // console.log(sess)
    // console.log(req.body)
    
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
        //console.log(requestUri + '?' + querystring.stringify(data))
        res.redirect(requestUri + '?' + querystring.stringify(data));
    } else {
        res.redirect('/');
    }
});

router.post('/', isAuthorized, (req, res) => {
    //console.log("ceva")
    var token = req.body.spotify.token;
    const refresh_token = req.body.spotify.refresh_token;
    // console.log("conn")
    //console.log(token)
    // console.log(req.session)
    req.session.user.spotify = { token, refresh_token };

    const sess = req.session;
    //token = "BQADCYRhGuYaxqJoSpJUYsqs1uegD9vrLczqj1KDGSwLKympG-icvKVR2QECYcw3I0to9SowUvoYipdOxAXTj1oMbhK194h0c-eejbJOSc8JZysnS3dY7nQ0McnezgFjrw4hzsbBV2M2-lY3AdOwFauM1v3BDFQ11yqj9KW34V-fK74_JMiYRd7FvbbXAns";
    request.get("http://localhost:5000/get-me",{
        json: { token }
    }, (req, response) => {
        console.log("ajung aici3")
        //console.log(res)
        sess.user.spotify.id = response.body.id;
        sess.user.spotify.href = response.body.href;
        sess.user.spotify.name = response.body.diplay_name;
        sess.user.spotify.picture = response.body.picture;
        console.log(sess.user)

        storage.setItem(sess.wa.token, JSON.stringify({
            wa: sess.wa,
            user: sess.user
        }));
        res.end();
    });


    const requestUri = `http://localhost:4000/update-spotify-token`;

    // console.log(req.session.user.spotify.refresh_token);rs
    // console.log(req.session.wa.token);
    request.put(requestUri, {
        json: {
            spotify_token: req.session.user.spotify.refresh_token,
            user_token: req.session.wa.token
        }
    });
    
});

module.exports = router;