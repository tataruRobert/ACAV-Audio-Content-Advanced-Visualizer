const express = require('express');
const app = express();
//let User = require("../../models/user.js");
const router = express.Router();
const bodyParser = require('body-parser');


var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: { type: String, required: true, max: 100 },
  email: { type: String, required: true, max: 100 },
  password: { type: String, required: true, max: 100 },
}, { collection: 'User' });

mongoose.model('User', UserSchema);

User = mongoose.model("User");

console.log(mongoose.modelNames())

var mongoDB = "mongodb+srv://robertT:parola1234@cluster0-zknkc.mongodb.net/ACAV?retryWrites=true&w=majority";
mongoose.connect(mongoDB, { useUnifiedTopology: true, useNewUrlParser: true  });

app.use(bodyParser.json());

router.get('/', function(req, res, next) {
    res.send('respond with a resource');
  });

router.post('/register', function(req, res, next) {
    var newUser = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    }
    var user = new User(newUser);
    user.save().then(() => {
        console.log("New User");
    }).catch((err) => {
        if (err) {
            throw err;
        }
    })
    res.send('Testing post');
});

router.post('/login', (req, res) => {
    
    const email = req.body.email;
    const password = req.body.password;
    User.find({ 'email': email }, function (err, result) {
        if (err) return handleError(err);
        console.log(result[0])
        if (result ){//&& result.length === 1) {
            if (result[0].password === password) {
                res.json({
                    name: result[0].name
                });
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


const port = process.env.port || 4000;
app.use('/', router);
app.listen(port);

console.log(`Running at Port ${port}`);


