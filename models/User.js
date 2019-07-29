const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

let UserSchema = new mongoose.Schema({
    username: String,
    firstName: String,
    lastName: String,
    password: String,
    liked_rooms: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room"
        }
    ],
    disliked_rooms: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room"
        }
    ]
});

UserSchema.plugin(passportLocalMongoose);
let User = mongoose.model('User', UserSchema);
module.exports = User