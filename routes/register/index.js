var express = require('express');
var router = express.Router();
var request = require("request")

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('register', { message: '' });
});

router.post('/', (req, res) => {
    
    const email = req.body.email;
    const password = req.body.password;
    const userApiRegister = "http://localhost:4000/register"

    //const name = "Tataru Robert";
    if (password) {
        if (password.length >= 6) {
            request.post(userApiRegister, {
                json: {email, password }
            }, (error, response, body) => {
                if (!error && response.statusCode === 200) {
                    res.redirect('http://localhost:3000/login')
                }
            });
        }
    }
});

module.exports = router;