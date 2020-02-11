var express = require('express');
var router = express.Router();
var request = require("request")
const { isAuthorized } = require('../../session');

/* GET home page. */
router.get('/',isAuthorized, function(req, res, next) {
  const sess = req.session;

  //console.log(sess)

    const data = {
        email: sess.user.email
    };

    if (sess.user.spotify) {
      data.spotify = {
        href: sess.user.spotify.href,
        name: sess.user.spotify.name,
        picture: sess.user.spotify.picture
      };

      data.arts =  {};
      var token = sess.user.spotify.token
  
      request.get("http://localhost:5000/top-artists",{
            json: { token }
        }, (req, response) => {
            //console.log(response)
            var artists = response.body
            //console.log(artists)
            for (let i = 0; i < 10; i++) {
                data.arts[i] = {
                  name: artists[i].name,
                  popularity: artists[i].popularity,
                  id: artists[i].id,
                  image: artists[i].image
                };
            }
            //console.log(data)
            res.render('home', data);
        });
        
  } else {
    res.render('home', data);
  }
    
});

module.exports = router;
