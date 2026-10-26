// server.js

// set up ======================================================================
// get all the tools we need
require('dotenv').config()

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const methodOverride = require('method-override')
const passport = require('passport');

const app = express(); //calling on express stored in line 7
const port = process.env.PORT || 3000; //first arg looks for an env (environment) file saved in another foler

// configuration ===============================================================
require('./config/database')// connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // get information from html forms
app.use(express.static('public'))
app.use(methodOverride('_method'))

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax'
    }
}))

app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

// launch ======================================================================
//routes
require('./app/routes')(app, passport)

app.listen(port);
console.log('Port ' + port )+ ' is live.';