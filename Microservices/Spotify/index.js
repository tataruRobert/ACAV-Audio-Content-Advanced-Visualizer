const express = require('express');
var request = require('request'); // "Request" library
const app = express();
const crypto = require('crypto');
var querystring = require('querystring');
var cookieParser = require('cookie-parser')
var countries = require('./countries');
const expressSession = require('express-session');

const router = express.Router();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(expressSession({
    name: "nume",
    secret: "secret",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }))

// SPOTIFY STUFF
var client_id = '07547ceec46d44e4b78577468e8f35d7'; // Your client id
var client_secret = '85e45db5049a455083c61d93576574f7'; // Your secret
const redirectUri = `http://localhost:5000/callback`;

var stateKey = 'spotify_auth_state';

var generateRandomString = function(length) {
    var text = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
    for (var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  };

router.get('/login', (req, res) => {
    const sess = req.session;
    

    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    if (req.query) {
        req.session.redirectUri = req.query.redirectUri;
        req.session.email = req.query.email;
        req.session.token = req.query.token;
    }
    console.log("spot")
    console.log(sess)
    
    const scope = 'user-read-private user-read-email user-library-read user-follow-read';
    res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirectUri,
      state: state
    }));
});

router.get('/callback', (req, res) => {
    // your application requests refresh and access tokens
  // after checking the state parameter
  var code = req.query.code || null;
  var state = req.query.state || null;
  var storedState = req.cookies ? req.cookies[stateKey] : null;

    const responseUri = req.session.redirectUri;
    const wa = { token: req.session.token };

  if (state === null || state !== storedState) {
    res.redirect('/#' +
        querystring.stringify({
            error: 'state_mismatch'
        }));
    } else {
        res.clearCookie(stateKey);

        var authOptions = {
                url: 'https://accounts.spotify.com/api/token',
                form: {
                code: code,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code'
                },
                headers: {
                'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
                },
                json: true
        };
        request.post(authOptions, function(error, response, body) {
            if (!error && response.statusCode === 200) {
                const refresh_token = body.refresh_token;
                var access_token = body.access_token;
                console.log("aici")
                console.log(access_token)
                //er_display_name = "";

                request.post("http://localhost:3000/connect", {
                    json: {
                        spotify: {
                            token: access_token,
                            refresh_token: refresh_token
                        },
                        wa
                    }
                }, (error, response, body) => {
                    console.log("ajung aici")
                    if (!error && response.statusCode === 200) {
                            console.log("ajung aici")
                            res.redirect("http://localhost:3000/connect" + '/?' + querystring.stringify({
                            wa: wa.token
                        }));
                    }
                });
                

                // var options = {
                // url: 'https://api.spotify.com/v1/me',
                // headers: { 'Authorization': 'Bearer ' + access_token },
                // json: true
                // };

                // request.get(options, function(error, response, body) {
                //     let user_url = "https://api.spotify.com/v1/me";
            
                //         user_display_name = body.display_name;
                //         //console.log(body);
                //         var userId = body.id

                //         let top_artists_url = "https://api.spotify.com/v1/users/"+userId+"/playlists";
                //         //console.log(top_artists_url)
                //         request({url:top_artists_url, headers: { 'Authorization': 'Bearer ' + access_token }}, function(err,res){
                //             if(res){
                //             let top_artists = JSON.parse(res.body);
                //             //console.log(res.body.list_top_artists_artist);
                //                 //console.log(top_artists.items);
                //                 //console.log("ceva");
                                
                //             } else if (err){
                //               console.log('Nu s-a putu citi top artists');
                //             }
                //           });
                //           request.post("http://localhost:3000/connect", {
                //             json: {
                //                 spotify: {
                //                     token: access_token,
                //                     refresh_token: refresh_token
                //                 },
                                
                //             }
                //         }, (error, response, body) => {
                //             if (!error && response.statusCode === 200) {
                //                 res.redirect("http://localhost:3000/connect");
                //             }
                //         });
                          

                // });

            } else {
                res.status(403).json({ message: 'invalid token' })
            }
        });
        
     }
      
});

router.get('/top-playlist-countries', (req, res) => {
    var result = {}
    var i = 0;
    Object.keys(countries).forEach(key=>{
        console.log(`${key} : ${countries[key]}`);
        var cheie = key;
        var countryID = countries[key];
        var access_token = "BQCdS0V9pvhKwx1yPUIIyB7P95Znn_tAAHBe7odjiL6gDXVe1eBpaTc-LgL5HbSasFP33JdW04PBMuznof4Y_idPBH_jUclpnUaN--2YQvH98HvCuH5rvo_g1QPpBRmGtzFiEYN_yQ6kkHYn1bPkbKKcbDEbsZGzNR6-ajeUKnYwQCU-QBf4ZafeC0reYD8";
        let playlist_url = "https://api.spotify.com/v1/playlists/" + countryID + '/';
        
        request({url:playlist_url, headers: { 'Authorization': 'Bearer ' + access_token }}, function(err,response){
            i = i + 1;
            if(response){
                let list = [];
                let content = JSON.parse(response.body);
                //console.log(content.tracks.items)
                let index = 1;
                content.tracks.items.forEach(song =>  {

                    let name = song.track.name;
                    let artist = song.track.artists[0].name;
                    let data = {
                        name, artist
                    };
                    if (index < 6) {
                        list.push(data)
                    }
                    //console.log(song.track.name+ "/ /" + song.track.artists[0].name);
                    //console.log(data)
                    index = index + 1
                })
                var tracks = list;
                result[cheie] = tracks;
                console.log(result)
                console.log(i);
                if (i === 15) {
                    res.json(result);
                }

                } else if (err){
                console.log('Nu s-a putu citi top artists');
                }
        });
        
     });
    //res.json(result);


});


router.get('/top-tracks', (req, res) => {
    var access_token = "BQCdS0V9pvhKwx1yPUIIyB7P95Znn_tAAHBe7odjiL6gDXVe1eBpaTc-LgL5HbSasFP33JdW04PBMuznof4Y_idPBH_jUclpnUaN--2YQvH98HvCuH5rvo_g1QPpBRmGtzFiEYN_yQ6kkHYn1bPkbKKcbDEbsZGzNR6-ajeUKnYwQCU-QBf4ZafeC0reYD8";
    let url = "https://api.spotify.com/v1/me/tracks"
    request({url:url, headers: { 'Authorization': 'Bearer ' + access_token }}, function(err,response){
        if(response){
            
            let content = JSON.parse(response.body);
            console.log(content.items);
            let list = [];
            let index = 1;
            //console.log(typeof content)
            content.items.forEach(song =>  {
                let name = song.track.name;
                let artist = song.track.artists[0].name;
                let popularity = song.track.popularity;
                let data = {
                    name, artist, popularity
                };
                if (index < 11) {
                    list.push(data)
                }
                if (index === 10) {
                    res.json(list);
                }
                //console.log(song.track.name+ "/ /" + song.track.artists[0].name);
                //console.log(data)
                index = index + 1
            })
            } else if (err){
            console.log('Nu s-a putu citi top artists');
            }
    });

});


router.get('/top-albums', (req, res) => {
    var access_token = "BQCdS0V9pvhKwx1yPUIIyB7P95Znn_tAAHBe7odjiL6gDXVe1eBpaTc-LgL5HbSasFP33JdW04PBMuznof4Y_idPBH_jUclpnUaN--2YQvH98HvCuH5rvo_g1QPpBRmGtzFiEYN_yQ6kkHYn1bPkbKKcbDEbsZGzNR6-ajeUKnYwQCU-QBf4ZafeC0reYD8";
    let url = "https://api.spotify.com/v1/me/albums"
    request({url:url, headers: { 'Authorization': 'Bearer ' + access_token }}, function(err,response){
        if(response){
            
            let content = JSON.parse(response.body);
            console.log(content.items);
            let list = [];
            let index = 1;
            //console.log(typeof content)
            content.items.forEach(album =>  {
                let name = album.album.name;
                let artist = album.album.artists[0].name;
                let popularity = album.album.popularity;
                let data = {
                    name, artist, popularity
                };
                if (index < 11) {
                    list.push(data)
                }
                if (index === 10) {
                    res.json(list);
                }
                //console.log(song.track.name+ "/ /" + song.track.artists[0].name);
                //console.log(data)
                index = index + 1
            })
            console.log(list)
            } else if (err){
            console.log('Nu s-a putu citi top artists');
            }
    });

});

router.get('/top-artists', (req, res) => {
    var access_token = "BQCdS0V9pvhKwx1yPUIIyB7P95Znn_tAAHBe7odjiL6gDXVe1eBpaTc-LgL5HbSasFP33JdW04PBMuznof4Y_idPBH_jUclpnUaN--2YQvH98HvCuH5rvo_g1QPpBRmGtzFiEYN_yQ6kkHYn1bPkbKKcbDEbsZGzNR6-ajeUKnYwQCU-QBf4ZafeC0reYD8";
    let url = "https://api.spotify.com/v1/me/following?type=artist"
    request({url:url, headers: { 'Authorization': 'Bearer ' + access_token }}, function(err,response){
        if(response){
            
            let content = JSON.parse(response.body);
            console.log(content.artists);
            let list = [];
            let index = 1;
            //console.log(typeof content)
            content.artists.items.forEach(artist =>  {
                let name = artist.name;
                let popularity = artist.popularity;
                let data = {
                    name, popularity
                };
                if (index < 11) {
                    list.push(data)
                }
                if (index === 10) {
                    res.json(list);
                }
                //console.log(song.track.name+ "/ /" + song.track.artists[0].name);
                //console.log(data)
                index = index + 1
            })
            console.log(list)
            } else if (err){
            console.log('Nu s-a putu citi top artists');
            }
    });

});


const port = process.env.port || 5000;
app.use(cookieParser());
app.use('/', router);
app.listen(port);

console.log(`Running at Port ${port}`);
console.log(countries);
