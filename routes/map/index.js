var express = require('express');
var router = express.Router();
var request = require("request")
const bodyParser = require('body-parser');
const { isAuthorized } = require('../../session');


router.get('/', isAuthorized, function(req, res, next) {
    const sess = req.session;
    var token = sess.user.spotify.token
    let url = "http://localhost:5000/top-playlist-countries";
    request.get(url, {
        json: { token }
    }, (error, response, body) => {
        countr = body;
        data = {
            countries: countr
        }
        res.render("map", data);
    });    
    
});


module.exports = router;