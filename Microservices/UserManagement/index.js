const express = require('express');
const app = express();
//let User = require("../../models/user.js");
const router = express.Router();
const bodyParser = require('body-parser');


var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  token: { type: String, required: true, max: 100 },
  email: { type: String, required: true, max: 100 },
  password: { type: String, required: true, max: 100 },
  spotifyToken: { type: String, required: true, max: 100 },
}, { collection: 'User' });

mongoose.model('User', UserSchema);

User = mongoose.model("User");

//console.log(mongoose.modelNames())

var mongoDB = "mongodb+srv://robertT:parola1234@cluster0-zknkc.mongodb.net/ACAV?retryWrites=true&w=majority";
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true  });

app.use(bodyParser.json());

var md5 = require('md5');
const tokenGenerator = function (email, password) {
    var token = '';
    for (var i = 0; i < email.length; i++) {
        token += email.charAt(i);
        token += password.charAt(i);
    }
    return token;
};

router.get('/', function(req, res, next) {
    res.send('respond with a resource');
  });

router.post('/register', function(req, res, next) {
    const email = req.body.email;
    var password = req.body.password;
    password = md5(password);
    const token = tokenGenerator(email, password);
    var newUser = {
        token: token,
        email: email,
        password: password,
        spotifyToken: " "
    }
    var user = new User(newUser);
    user.save().then(() => {
        res.status(200).send({
            "success": "You have been registered!"
        });
    }).catch((err) => {
        if (err) {
            console.log(err)
            res.status(404).send({
                "error": "Something went wrong!"
            });
        }
    })
    //res.send('Testing post');
});

router.post('/login', (req, res) => {
    
    const email = req.body.email;
    const password = req.body.password;
    User.find({ 'email': email }, function (err, result) {
        if (err) return handleError(err);
        //console.log(result[0])
        if (result ){//&& result.length === 1) {
            if (result[0].password === md5(password)) {
                //console.log(result[0])
                res.json({
                    token: result[0].token,
                    spotify_token: result[0].spotifyToken
                });
                //console.log("e bine")
            }else {
                res.json({
                    "message": "Incorrect password"
                });
            }
        }else {
            res.status(404).json({
                message: 'Email or password is incorrect!'
            });
        }
      })

    //res.send('Testing post');
});

router.put('/update-spotify-token',async (req, res) => {
    const spotifyToken = req.body.spotify_token;
    const usertoken = req.body.user_token;
    await User.updateOne({ token: usertoken }, {
        spotifyToken: spotifyToken
      });
    res.status(200).send({
        "message": "Token updated!"
    })
});

const port = process.env.port || 4000;
app.use('/', router);
app.listen(port);

console.log(`Running at Port ${port}`);


