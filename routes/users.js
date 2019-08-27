const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User')

function createUser(newUser, password, req, res) {
    User.register(newUser, password, (err, user) => {
        if (err) {
            console.log(err)
            res.redirect('/')
        } else {
            passport.authenticate('local')(req, res, () => {
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
    .post((req, res, next) => {
        passport.authenticate('local', (err, user, info) => {
            if (err) { return next(err) }
            if (!user) {
                return res.redirect('/login')
            }
            req.logIn(user, err => {
                if (err) { console.log('login fail') }
                let redirectTo = req.session.redirectTo ? req.session.redirectTo : '/';
                delete req.session.redirectTo;
                res.redirect(redirectTo)
            })
        })(req, res, next)
    });



router.route('/register')
    .get((req, res) => {
        res.render('./Auth/register')
    })
    .post((req, res) => {
        if (
            req.body.username &&
            req.body.firstName &&
            req.body.lastName &&
            req.body.password
        ) {
            let newUser = new User({
                username: req.body.username,
                firstName: req.body.firstName,
                lastName: req.body.lastName
            });
            return createUser(newUser, req.body.password, req, res);
        }
    })
router.route('/logout')
    .get((req, res) => {
        req.logOut();
        res.redirect('/')
    });
router.route('/profile/:id')
    .get((req, res) => {
        User.findById(req.params.id, (err, foundUser) => {
            if (err) {
                console.log(err)
                res.redirect('back')
            }
            res.render('./profile', { user: foundUser })
        })
    })
module.exports = router;