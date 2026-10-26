const express = require('express') //loading express

const app = express() //creating app
const PORT = 3001

app.set('view engine', 'ejs') //rendering pages

app.use(express.static('public')) //pulls from public folder to make css & js accessible 

require('./app/routes')(app) //loads the routes function and calls it with app

app.listen(PORT, () => {
    console.log(`WebSeek is running at http://localhost:${PORT}`)
})