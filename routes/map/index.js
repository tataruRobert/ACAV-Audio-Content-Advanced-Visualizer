var express = require('express');
var router = express.Router();
var request = require("request")
const bodyParser = require('body-parser');


router.get('/', function(req, res, next) {
    let url = "http://localhost:5000/top-playlist-countries";
    request.get(url, (error, response, body) => {
        console.log(JSON.parse(body));
        countr = JSON.parse(body);
        data = {
            countries: countr
        }
        console.log(data)
        res.render("map", data);
    })
    
    
});


module.exports = router;