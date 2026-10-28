module.exports = function (app) {
    app.get('/', (req, res) => {
        res.render('welcome')
    })

    app.get('/login', (req, res) => {
        res.render('login')
    })

    app.get('/signup', (req, res) => {
        res.render('signup')
    })

    app.get('/dashboard', (req, res) => {
        res.render('dashboard')
    })
}