require('dotenv').config()

const express = require('express')
require('./config/database')

const app = express() //creating app
const session = require('express-session')
const PORT = 3001

app.set('view engine', 'ejs') //rendering pages

app.use(express.static('public')) //pulls from public folder to make css & js accessible 
app.use(express.urlencoded({ extended: false }))

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 1000 * 60 * 60
    }
}))

require('./app/routes')(app) //loads the routes function and calls it with app

app.listen(PORT, () => {
    console.log(`WebSeek is running at http://localhost:${PORT}`)
})