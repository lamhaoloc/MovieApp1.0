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
router.route('/room/new/video')
    .post((req, res) => {
        console.log(req.body.searchQuery)
    })
module.exports = router;