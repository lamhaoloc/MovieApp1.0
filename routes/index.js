const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const Comment = require('../models/Comment');
const User = require('../models/User');


function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/user/login');
    }
};

router.get('/', (req, res) => {
    res.render('index', { title: 'Home' })
})

router.get('/home', isLoggedIn, async function (req, res) {
    const redis = require('redis');
    const util = require('util')

    const redisUrl = 'redis://127.0.0.1:6379';
    const client = redis.createClient(redisUrl);
    client.get = util.promisify(client.hget);
    const hashKey = 'default'
    const cachedRoom = await client.hget(hashKey, req.user.id)
    let noMatch = null

    if (cachedRoom) {
        console.log('using redis')
        if (cachedRoom.length < 1) {
            noMatch = 'No Room found, let create one'
            res.render('./Rooms/main', { rooms: JSON.parse(cachedRoom), title: 'All Rooms', noMatch: noMatch })
        } else {
            res.render('./Rooms/main', { title: 'All Rooms', rooms: JSON.parse(cachedRoom), noMatch: noMatch })
        }
    } else {
        Room.find({}, function (err, allRoom) {
            console.log('using mongoDB')
            if (err) { console.log(err) }
            else {
                if (allRoom.length < 1) {
                    noMatch = 'No Room found, let create one'
                    res.render('./Rooms/main', { rooms: allRoom, title: 'All Rooms', noMatch: noMatch })
                } else {
                    res.render('./Rooms/main', { title: 'All Rooms', rooms: allRoom, noMatch: noMatch })
                }
                client.hset(hashKey, req.user.id, JSON.stringify(allRoom))
            }
        })
    }
});

router.route('/room/new')
    .get(isLoggedIn, (req, res) => {
        res.render('./Rooms/new', { title: 'New Room' })
    })
    .post(isLoggedIn, (req, res) => {
        res.render('./Rooms/confirmNewRoom', { room: req.body, title: req.body.title })
    })
router.route('/room/new/video')
    .post(isLoggedIn, (req, res) => {
        res.send('Got it!!!')
    })
router.route('/room/new/video/confirmed')
    .post(isLoggedIn, async (req, res) => {
        const newRoom = new Room({
            title: req.body.title,
            thumbnail: req.body.thumbnail,
            content: req.body.content,
            videoId: req.body.videoId,
            author: {
                id: req.user._id,
                username: req.user.lastName
            },
            likes: 0,
            dislikes: 0
        })
        try {
            await newRoom.save();
            res.redirect("/home");
        } catch (err) {
            res.redirect('back')
        }
    })

router.route('/home/:id')
    .get(isLoggedIn, (req, res) => {
        Room.findById(req.params.id)
            .populate('comments')
            .populate('replies')
            .exec((err, room) => {
                if (err) {
                    console.log(err)
                } else {
                    Comment.find({})
                        .populate('replies')
                    res.render('./Rooms/showroom', { room: room })
                }
            })
    })

router.route('/home/:id/edit')
    .get(isLoggedIn, (req, res) => {
        Room.findById(req.params.id, (err, foundRoom) => {
            if (err) {
                res.redirect('/home')
            } else {
                res.render('./Rooms/edit', { room: foundRoom })
            }
        })
    })
    .put((req, res) => {
        console.log(req.body.room)
        let { title, content } = {
            title: req.body.room.title,
            content: req.body.room.content,
        }
        let newData = { title, content };
        Room.findByIdAndUpdate(req.params.id, { $set: newData }, (err, updatedRoom) => {
            if (err) {
                res.redirect('/home')
            } else {
                res.redirect('/home/' + req.params.id)
            }
        })
    });

router.route('/home/:id')
    .delete((req, res) => {
        Room.findByIdAndRemove(req.params.id, (err) => {
            if (err) {
                res.redirect('/home')
            } else {
                res.redirect('/home')
            }
        })
    });
router.route('/home/:id/like')
    .get(isLoggedIn, (req, res) => {
        User.findById(req.user.id, (err, foundUser) => {
            if (err) {
                console.log(err)
                res.redirect('back')
            } else {
                Room.findById(req.params.id, (err, foundRoom) => {
                    if (err) {
                        console.log(err)
                        res.redirect('back')
                    } else {
                        for (let i = 0; i < foundUser.liked_rooms.length; i++) {
                            if (foundUser.liked_rooms[i].equals(foundRoom._id)) {
                                return res.redirect("back");
                            }
                        }
                        foundRoom.likes += 1;
                        foundRoom.save();
                        foundUser.liked_rooms.push(foundRoom._id);
                        foundUser.save();
                        res.redirect('back')
                    }
                })
            }
        })
    });
router.route('/home/:id/dislike')
    .get((req, res) => {
        User.findById(req.user.id, (err, foundUser) => {
            if (err) {
                console.log(err)
                res.redirect('back')
            } else {
                Room.findById(req.params.id, (err, foundRoom) => {
                    if (err) {
                        console.log(err)
                        res.redirect('back')
                    } else {
                        for (let i = 0; i < foundUser.disliked_rooms.length; i++) {
                            if (foundUser.disliked_rooms[i].equals(foundRoom._id)) {
                                return res.redirect('back')
                            }
                        }
                        foundRoom.dislikes += 1;
                        foundRoom.save();
                        foundUser.disliked_rooms.push(foundRoom._id);
                        foundUser.save();
                        res.redirect('back')
                    }
                })
            }
        })
    });

// New commment on room
router.route('/home/:id/comments/new')
    .post(isLoggedIn, (req, res) => {
        Room.findById(req.params.id, (err, foundRoom) => {
            if (err) {
                console.log(err)
            } else {
                Comment.create({ content: req.body.content }, (err, createdComment) => {
                    if (err) {
                        console.log(err)
                    } else {
                        createdComment.creator._id = req.user._id;
                        createdComment.creator.firstName = req.user.firstName;
                        createdComment.creator.lastName = req.user.lastName;
                        createdComment.likes = 0;
                        createdComment.save();
                        foundRoom.comments.push(createdComment);
                        foundRoom.save();
                        res.redirect('back');
                    }
                })
            }
        })
    })

router.route('/home/:id/comments/reply')
    .post(isLoggedIn, (req, res) => {
        User.findById(req.user.id, (err, foundUser) => {
            if (err) {
                throw new Error(err)
            } else {
                Comment.findById(req.params.id, (err, foundComment) => {
                    if (err) {
                        console.log(err)
                    } else {
                        var newRelpy = { _id: foundUser._id, content: req.body.content, author: req.user.lastName };
                        foundComment.replies.push(newRelpy);
                        foundComment.save();
                        res.redirect('back')
                    }
                })
            }
        })
    })
router.route('/home/:id/comments/like')
    .get((req, res) => {
        User.findById(req.user.id, (err, foundUser) => {
            if (err) {
                console.log(err)
            } else {
                Comment.findById(req.params.id, (err, foundComment) => {
                    if (err) {
                        console.log(err)
                    } else {
                        foundComment.likes += 1;
                        foundComment.save();
                        foundUser.liked_comments.push(foundComment);
                        foundUser.save()
                        res.redirect('back')
                    }
                })
            }
        })
    })
var counter = 0;
router.get('/counter', function (req, res) {
    res.cookie('counter', ++counter);

    if (!req.cookies.counter) {
        res.send('This is your first visit!');
    } else {
        res.send('This is visit number ' + req.cookies.counter + '!');
    }
});
module.exports = router;



