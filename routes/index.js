const express = require('express');
const router = express.Router();
const Room = require('../models/Room')

router.get('/', (req, res) => {
    res.render('index', { title: 'Home' })
})

router.route('/home')
    .get((req, res) => {
        Room.find({}, (err, allRoom) => {
            let noMatch = null
            if (err) { console.log(err) }
            else {
                if (allRoom.length < 1) {
                    noMatch = 'No Room found, let create one'
                    res.render('./Rooms/main', { rooms: allRoom, title: 'All Rooms', noMatch: noMatch })
                } else {
                    res.render('./Rooms/main', { title: 'All Rooms', rooms: allRoom, noMatch: noMatch })
                }
            }
        })
    });
router.route('/room/new')
    .get((req, res) => {
        res.render('./Rooms/new', { title: 'New Room' })
    })
    .post((req, res) => {
        res.render('./Rooms/confirmNewRoom', { room: req.body, title: req.body.title })
    })
router.route('/room/new/video')
    .post((req, res) => {
        res.send('Got it!!!')
    })
router.route('/room/new/video/confirmed')
    .post(async (req, res) => {
        const { title, thumbnail, content, videoId } = req.body;
        const newRoom = new Room({
            title,
            thumbnail,
            content,
            videoId
        })
        try {
            await newRoom.save();
            res.redirect("/home");
        } catch (err) {
            res.redirect('back')
        }
    })
router.route('/home/:id')
    .get((req, res) => {
        console.log(req.user)
        Room.findById(req.params.id, (err, foundRoom) => {
            if (err) {
                res.send('hihi')
            } else {
                res.render('./Rooms/showroom', { room: foundRoom })
            }
        })
    })
module.exports = router;



