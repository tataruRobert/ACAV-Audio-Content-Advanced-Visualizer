/* path: /spotify */

var express = require('express');
var router = express.Router();
var request = require("request")
const { isAuthorized } = require('../../session');


router.get('/songs', isAuthorized, (req, res) => {
    var data = {}
    data.spotify = {
        
    }
    const sess = req.session;
    //console.log(srsess)
    var token = sess.user.spotify.token
    //console.log(token)
    request.get("http://localhost:5000/top-tracks",{
        json: { token }
    }, (req, response) => {
        //console.log(response)
        var songs = response.body
        console.log(songs)
        for (let i = 0; i < songs.length; i++) {
            //console.log(response[i].name)
            data.spotify[String(songs[i].name) + " by " + String(songs[i].artist)] = songs[i].popularity;
        }
        console.log(data)
        res.render('./spotify/songs', data);
    });
    
   
});



module.exports = router;