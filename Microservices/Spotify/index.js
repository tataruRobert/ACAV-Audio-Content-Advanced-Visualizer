const express = require('express');
var request = require('request'); // "Request" library
const app = express();
const crypto = require('crypto');
var querystring = require('querystring');
var cookieParser = require('cookie-parser')
var countries = require('./countries');

const router = express.Router();
const bodyParser = require('body-parser');
app.use(bodyParser.json());

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
    

    var state = generateRandomString(16);
    res.cookie(stateKey, state);
    
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
                var access_token = body.access_token;
                console.log(access_token)
                //er_display_name = "";
                

                var options = {
                url: 'https://api.spotify.com/v1/me',
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
                };

                request.get(options, function(error, response, body) {
                    let user_url = "https://api.spotify.com/v1/me";
            
                        user_display_name = body.display_name;
                        //console.log(body);
                        var userId = body.id

                        let top_artists_url = "https://api.spotify.com/v1/users/"+userId+"/playlists";
                        console.log(top_artists_url)
                        request({url:top_artists_url, headers: { 'Authorization': 'Bearer ' + access_token }}, function(err,res){
                            if(res){
                            let top_artists = JSON.parse(res.body);
                            //console.log(res.body.list_top_artists_artist);
                                console.log(top_artists.items);
                        
                                
                            } else if (err){
                              console.log('Nu s-a putu citi top artists');
                            }
                          });

                });

            } else {

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
        var access_token = "BQAX2s7czzA-pqga1OU4RCxCdJpy308Nux85GBh8A-pGEMb8SkR6GKjlnvOPU-Zv1bShaXFomrPEKBdLTJ0MCKrl_4jlIyAlqCiacC_E4o7STauZ40fSTik2OPMbjRCNm7qGVQz4t2UWw6gTiLGBlTe8Dfxtxa6neNHIYMFMjShykmijSgMLIP8bP-JlBDU";
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

                //res.json(result)
                //res.send("");
                } else if (err){
                console.log('Nu s-a putu citi top artists');
                }
        });
        
     });
    //res.json(result);


});



const port = process.env.port || 5000;
app.use(cookieParser());
app.use('/', router);
app.listen(port);

console.log(`Running at Port ${port}`);
console.log(countries);
