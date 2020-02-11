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
    var token = sess.user.spotify.token
    request.get("http://localhost:5000/top-tracks",{
        json: { token }
    }, (req, response) => {
        var songs = response.body
        for (let i = 0; i < songs.length; i++) {
            data.spotify[String(songs[i].name) + " by " + String(songs[i].artist)] = songs[i].popularity;
        }
        res.render('./spotify/songs', data);
    });
    
   
});

router.get('/albums', isAuthorized, (req, res) => {
    var data = {}
    data.spotify = {
        
    }
    const sess = req.session;
    //console.log(srsess)
    var token = sess.user.spotify.token
    //console.log(token)
    request.get("http://localhost:5000/top-albums",{
        json: { token }
    }, (req, response) => {
        //console.log(response)
        var albums = response.body
        //console.log(albums)
        for (let i = 0; i < albums.length; i++) {
            //console.log(response[i].name)
            data.spotify[String(albums[i].name) + " by " + String(albums[i].artist)] = albums[i].popularity;
        }
        //console.log(data)
        res.render('./spotify/albums', data);
    });
    
   
});

router.get('/artists', isAuthorized, (req, res) => {
    var data = {}
    data.spotify = {
        
    }
    const sess = req.session;
    //console.log(srsess)
    var token = sess.user.spotify.token
    //console.log(token)
    request.get("http://localhost:5000/top-artists",{
        json: { token }
    }, (req, response) => {
        //console.log(response)
        var artists = response.body
        //console.log(artists)
        for (let i = 0; i < artists.length; i++) {
            //console.log(response[i].name)
            data.spotify[String(artists[i].name)] = artists[i].popularity;
        }
        //console.log(data)
        res.render('./spotify/artists', data);
    });
    
   
});



module.exports = router;