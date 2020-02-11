var express = require('express');
var router = express.Router();
var request = require("request")
const { isAuthorized } = require('../../session');


router.get('/:id',isAuthorized, function(req, res, next) {
    const data = {
        
    };
    data.songs =  {};
    const sess = req.session;
    var token = sess.user.spotify.token
    var id = req.params.id
    request.get("http://localhost:5000/top-tracks-for-artist",{
                json: { token, id }
            }, (req, response) => {
                //console.log(response)
                var songs = response.body
                //console.log(artists)
                for (let i = 0; i < 10; i++) {
                    data.songs[i] = {
                    name: songs[i].name,
                    popularity: songs[i].popularity,
                    id: songs[i].id,
                    image: songs[i].image
                    };
                }
                //console.log(data)
                res.render('song-artist', data);
            });

});

router.get('/track/:id',isAuthorized, function(req, res, next) {
    var data = {
        
    };
    data.details = {

    }
    const sess = req.session;
    var token = sess.user.spotify.token
    var id = req.params.id
    //console.log(id)
    request.get("http://localhost:5000/audio-features-track",{
                json: { token, id }
            }, (req, response) => {
                var content = response.body;
                data.details = {
                    danceability: content.danceability,
                    energy: content.energy,
                    loudness: content.loudness,
                    speechiness: content.speechiness,
                    acousticness: content.acousticness,
                    instrumentalness: content.instrumentalness,
                    liveness: content.liveness,
                    valence: content.valence,
                    tempo: content.tempo
                }
                //console.log(data)
                res.render('song-details', data);
            });

});

module.exports = router;
