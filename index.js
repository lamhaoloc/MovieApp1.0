const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const flash = require('flash');
const mongoose = require('mongoose');
const User = require('./models/User');
const session = require('express-session');
const helmet = require('helmet');

//////////////////////////////////////////
const routes = require('./routes/index');
const users = require('./routes/users');
///////////// App Config ////////////////
var app = express()
var http = require('http').Server(app);
var io = require('socket.io')(http);
require('dotenv').config();
app.use(helmet());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//////////// Database Config //////////////
mongoose.set('useCreateIndex', true);
mongoose.connect('mongodb://localhost:27017/MovieApp', { useNewUrlParser: true });
//////////// View Engine Setup ////////////
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
/////////// SocketIo Config /////////////
io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        io.emit('chat message', msg);
    });
});
/////////// Passport Config /////////////
app.use(session({
    secret: "memem",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
///////// Flash Config ///////////
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});
/////////// Use Routes /////////////////
app.use('/', routes);
app.use('/user', users);
////////// Error Handlers //////////////
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

//////// Sever Listener ///////////
http.listen(process.env.PORT || 3000, () => {
    console.log('Connected')
})