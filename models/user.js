var mongoose = require('mongoose');
//var moment = require('moment'); // For date handling.

var Schema = mongoose.Schema;

var UserSchema = new Schema({
  name: { type: String, required: true, max: 100 },
  email: { type: String, required: true, max: 100 },
  password: { type: String, required: true, max: 100 },
}, { collection: 'User' });

module.exports = mongoose.model('User', UserSchema);