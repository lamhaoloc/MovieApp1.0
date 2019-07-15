const mongoose = require('mongoose');

let RoomSchema = new mongoose.Schema({
    title: String,
    createTime: { type: Date, default: Date.now },
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    thumbnail: String,
    content: String,
    videoId: String
});


let Room = mongoose.model('Room', RoomSchema);
module.exports = Room;