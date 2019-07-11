const express = require('express');
const router = express.Router();


router.get('/', (req, res) => {
    res.render('index', { title: 'Home' })
})

router.route('/home')
    .get((req, res) => {
        res.render('./Rooms/main', { title: 'All Rooms' })
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
module.exports = router;