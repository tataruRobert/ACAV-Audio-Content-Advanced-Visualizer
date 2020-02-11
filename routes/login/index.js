var express = require('express');
var router = express.Router();
const request = require('request');


router.get('/', async (req, res) => {
    res.render('login', { message: '' });
});

router.post('/', async (req, res) => {
    const sess = req.session;
    const email = req.body.email;
    const password = req.body.password;
    const userApiLogin = "http://localhost:4000/login";
    if (email && password) {
        if (password.length >= 6){
            request.post(userApiLogin, {
                json: { email, password }
            }, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    if (body && body.token) {
                        sess.wa = {
                            token: body.token,
                            date: new Date()
                        };
                        sess.user = {
                            email
                        };
                        console.log(body.spotify_token)
                        if (body.spotify_token) {
                            //var token = req.body.spotify.token;
                            sess.user.spotify = {refresh_token: body.spotify_token};
                            request.post("http://localhost:3000/connect/token", { 
                                json: { refresh_token: sess.user.spotify.refresh_token }
                            }, (error, response, body) => {
                                if (!error && response.statusCode === 200) {
                                    sess.user.spotify.token = body.token;
                                    token = body.token
                                    request.get("http://localhost:5000/get-me",{
                                        json: { token }
                                    }, (req, response) => {
                                        sess.user.spotify.id = response.body.id;
                                        sess.user.spotify.href = response.body.href;
                                        sess.user.spotify.name = response.body.diplay_name;
                                        sess.user.spotify.picture = response.body.picture;
                                        //console.log(sess.user)

                                        storage.setItem(sess.wa.token, JSON.stringify({
                                            wa: sess.wa,
                                            user: sess.user
                                        }));
                                        res.end();
                                    });
                                } else {
                                    delete sess.user.spotify;
                                    res.redirect("http://localhost:3000/");
                                }
                            });


                        } else {
                            res.redirect("http://localhost:3000/");
                        }
                    } else {
                        res.render('login', { message: body.message });
                    }
                }
            });
        }else {
            res.render('login', { message: 'Incorrect password'});
        }
    }
});

module.exports = router;