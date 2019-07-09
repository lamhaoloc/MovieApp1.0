const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User')

function createUser(newUser, password, req, res) {
    User.register(newUser, password, (err, user) => {
        if (err) {
            req.flash('error', err.message)
            res.redirect('/')
        } else {
            passport.authenticate('local')(req, res, () => {
                req.flash(
                    'success',
                    'Success! You are registered and logged in!'
                );
                res.redirect('/')
            })
        }
    })
}
/////////// Routes ///////////////// 
router.route('/login')
    .get((req, res) => {
        res.render('./Auth/login')
    })
    .post(passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }), (req, res) => { }
    )
router.route('/register')
    .get((req, res) => {
        res.render('./Auth/register')
    })
    .post((req, res) => {
        if (
            req.body.username &&
            req.body.firstname &&
            req.body.lastname &&
            req.body.password
        ) {
            let newUser = new User({
                username: req.body.username,
                firstName: req.body.firstname,
                lastName: req.body.lastname,
                profile: ''
            });
            return createUser(newUser, req.body.password, req, res);
        }
        return console.log('err')
    })
module.exports = router;