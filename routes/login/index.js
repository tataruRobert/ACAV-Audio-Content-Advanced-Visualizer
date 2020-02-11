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
                        //console.log(body.spotify_token)
                        
                        res.redirect("http://localhost:3000/");
                        
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