const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

let UserSchema = new mongoose.Schema({
    userName: String,
    firstName: String,
    lastName: String,
    passWord: String
});

UserSchema.plugin(passportLocalMongoose);
let User = mongoose.model('User', UserSchema);
module.exports = User