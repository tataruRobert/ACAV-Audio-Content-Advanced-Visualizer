var express = require('express');
var router = express.Router();
var request = require("request")
const bodyParser = require('body-parser');
const { isAuthorized } = require('../../session');


router.get('/', isAuthorized, function(req, res, next) {
    const sess = req.session;
    //console.log(srsess)
    var token = sess.user.spotify.token
    console.log(token)
    let url = "http://localhost:5000/top-playlist-countries";
    request.get(url, {
        json: { token }
    }, (error, response, body) => {
        // console.log(body)
        // console.log(JSON.parse(body));
        countr = body;
        data = {
            countries: countr
        }
        console.log(data)
        res.render("map", data);
    });    
    
});


module.exports = router;