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


                request.post("http://localhost:3000/connect", {
                    json: {
                        spotify: {
                            token: access_token,
                            refresh_token: refresh_token
                        },
                        wa
                    }
                }, (error, response, body) => {
                    if (!error && response.statusCode === 200) {
                            res.redirect("http://localhost:3000/connect" + '/?' + querystring.stringify({
                            wa: wa.token
                        }));
                    }
                });
                

            } else {
                res.status(403).json({ message: 'invalid token' })
            }
        });
        
     }
      
});

router.get('/get-me', (req, res) => {
    var access_token = req.body.token
    let user_url = "https://api.spotify.com/v1/me";
    request({url:user_url, headers: { 'Authorization': 'Bearer ' + access_token }}, function(err,response){
        if(response){
            let content = JSON.parse(response.body);
            
            if (content.images.length > 0) {
                var picture = content.images[0].url;
            }else {
                var picture = "";
            }

            res.json({
                diplay_name: content.display_name,
                id: content.id,
                href: content.external_urls.spotify,
                picture: picture
            });

            } else if (err){
                console.log('Nu s-a putut');
            }
    });
});

router.get('/top-playlist-countries', (req, res) => {
    var access_token = req.body.token
    var result = {}
    var i = 0;
    Object.keys(countries).forEach(key=>{
        //console.log(`${key} : ${countries[key]}`);
        var cheie = key;
        var countryID = countries[key];
        //var access_token = "BQDaW5Vz_nc5KER-tWLYSihA5YKQjy5DiQ7_4enAWCeFcMs0tE4k3nB8R_IeCZAvszU8bXmH5uGN0LpNqS0vHFmrBUiv-4d2JLbdWIu-c4J7M0qgf3SxOvqO7EJYENeoPDuXMha_JyXoXwvMCqVPwSYSpricxLgHt0c-g_kXGM0r7GNBDzmUeFtCyXgIWa4";
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
                    index = index + 1
                })
                var tracks = list;
                result[cheie] = tracks;
                if (i === 15) {
                    res.json(result);
                }

                } else if (err){
                console.log('Nu s-a putut citi top playlists');
                }
        });
        
     });
    //res.json(result);


});


router.get('/top-tracks', (req, res) => {
    var access_token = "BQCdS0V9pvhKwx1yPUIIyB7P95Znn_tAAHBe7odjiL6gDXVe1eBpaTc-LgL5HbSasFP33JdW04PBMuznof4Y_idPBH_jUclpnUaN--2YQvH98HvCuH5rvo_g1QPpBRmGtzFiEYN_yQ6kkHYn1bPkbKKcbDEbsZGzNR6-ajeUKnYwQCU-QBf4ZafeC0reYD8";
    access_token = req.body.token
    let url = "https://api.spotify.com/v1/me/tracks"
    request({url:url, headers: { 'Authorization': 'Bearer ' + access_token }}, function(err,response){
        if(response){
            
            let content = JSON.parse(response.body);
            let list = [];
            let index = 1;
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
                index = index + 1
            })
            } else if (err){
            //console.log('Nu s-a putu citi top artists');
            }
    });

});


router.get('/top-albums', (req, res) => {
    var access_token = "BQCdS0V9pvhKwx1yPUIIyB7P95Znn_tAAHBe7odjiL6gDXVe1eBpaTc-LgL5HbSasFP33JdW04PBMuznof4Y_idPBH_jUclpnUaN--2YQvH98HvCuH5rvo_g1QPpBRmGtzFiEYN_yQ6kkHYn1bPkbKKcbDEbsZGzNR6-ajeUKnYwQCU-QBf4ZafeC0reYD8";
    let url = "https://api.spotify.com/v1/me/albums"
    access_token = req.body.token
    request({url:url, headers: { 'Authorization': 'Bearer ' + access_token }}, function(err,response){
        if(response){
            
            let content = JSON.parse(response.body);
            let list = [];
            let index = 1;
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
                index = index + 1
            })
            
            } else if (err){
                console.log('Nu s-a putu citi top artists');
            }
    });

});

router.get('/top-artists', (req, res) => {
    var access_token = "BQCdS0V9pvhKwx1yPUIIyB7P95Znn_tAAHBe7odjiL6gDXVe1eBpaTc-LgL5HbSasFP33JdW04PBMuznof4Y_idPBH_jUclpnUaN--2YQvH98HvCuH5rvo_g1QPpBRmGtzFiEYN_yQ6kkHYn1bPkbKKcbDEbsZGzNR6-ajeUKnYwQCU-QBf4ZafeC0reYD8";
    let url = "https://api.spotify.com/v1/me/following?type=artist";
    access_token = req.body.token
    request({url:url, headers: { 'Authorization': 'Bearer ' + access_token }}, function(err,response){
        if(response){
            
            let content = JSON.parse(response.body);
            console.log(content.artists.items);
            let list = [];
            let index = 1;
            content.artists.items.forEach(artist =>  {
                let name = artist.name;
                let popularity = artist.popularity;
                let id = artist.id;
                let image = artist.images[0].url;
                let data = {
                    name, popularity, id, image
                };
                if (index < 11) {
                    list.push(data)
                }
                if (index === 10) {
                    res.json(list);
                }
                index = index + 1
            })
            } else if (err){
                console.log('Nu s-a putu citi top artists');
            }
    });

});

router.get('/top-tracks-for-artist', (req, res) => {
    var access_token = "BQCdS0V9pvhKwx1yPUIIyB7P95Znn_tAAHBe7odjiL6gDXVe1eBpaTc-LgL5HbSasFP33JdW04PBMuznof4Y_idPBH_jUclpnUaN--2YQvH98HvCuH5rvo_g1QPpBRmGtzFiEYN_yQ6kkHYn1bPkbKKcbDEbsZGzNR6-ajeUKnYwQCU-QBf4ZafeC0reYD8";
    access_token = req.body.token
    var id = req.body.id
    let url = "https://api.spotify.com/v1/artists/"+ id +"/top-tracks?country=RO";
    request({url:url, headers: { 'Authorization': 'Bearer ' + access_token }}, function(err,response){
        if(response){
            let content = JSON.parse(response.body).tracks;
            let list = [];
            let index = 1;
            content.forEach(song =>  {
                let name = song.name;
                let popularity = song.popularity;
                let id = song.id;
                let image = song.album.images[0].url;

                let data = {
                    name, id, popularity, image
                };
                if (index < 11) {
                    list.push(data)
                }
                if (index === 10) {
                    res.json(list);
                }
                index = index + 1
            })
            } else if (err){
                console.log('Nu s-a putu citi top artists');
            }
    });

});

router.get('/audio-features-track', (req, res) => {
    var access_token = "BQCdS0V9pvhKwx1yPUIIyB7P95Znn_tAAHBe7odjiL6gDXVe1eBpaTc-LgL5HbSasFP33JdW04PBMuznof4Y_idPBH_jUclpnUaN--2YQvH98HvCuH5rvo_g1QPpBRmGtzFiEYN_yQ6kkHYn1bPkbKKcbDEbsZGzNR6-ajeUKnYwQCU-QBf4ZafeC0reYD8";
    access_token = req.body.token
    var id = req.body.id
    let url = "https://api.spotify.com/v1/audio-features/" + id;
    request({url:url, headers: { 'Authorization': 'Bearer ' + access_token }}, function(err,response){
        if(response){
            let content = JSON.parse(response.body);
            res.json(content)
        }
    });

});

router.post('/token', (req, res) => {

    const refresh_token = req.body.refresh_token;

    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': `Basic ${buffer.toString('base64')}`
        },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, (error, response, body) => {
        if (!error && response.statusCode === 200) {
            res.json({ access_token: body.access_token })
        }
    });
});


const port = process.env.port || 5000;
app.use(cookieParser());
app.use('/', router);
app.listen(port);

console.log(`Running at Port ${port}`);
//console.log(countries);
