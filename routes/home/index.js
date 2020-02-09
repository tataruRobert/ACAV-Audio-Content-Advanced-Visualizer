var express = require('express');
var router = express.Router();
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
      console.log(data)

  }

  res.render('home', data);
});

module.exports = router;
