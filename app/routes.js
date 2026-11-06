const bcrypt = require('bcrypt')
const User = require('./models/user')
const searchBusinesses = require('../config/places')

module.exports = function (app) {
    app.get('/', (req, res) => {
        res.render('welcome')
    })

    //logging in
    app.get('/login', (req, res) => {
        res.render('login')
    })

    //authenticating user login
    app.post('/login', async (req, res) => {
        const { email, password } = req.body

        if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) {
            return res.status(400).send('Please enter your email and password.')
        }

        try {
            const user = await User.findOne({
                email: email.trim().toLowerCase()
            })

            if (!user) {
                return res.status(401).send('Incorrect email or password.')
            }

            const passwordMatches = await bcrypt.compare(password, user.password)

            if (!passwordMatches) {
                return res.status(401).send('Incorrect email or password.')
            }

            req.session.regenerate(err => {
                if (err) {
                    return res.status(500).send('Unable to log in. Please try again.')
                }

                req.session.userId = user._id.toString()

                req.session.save(err => {
                    if (err) {
                        return res.status(500).send('Unable to log in. Please try again.')
                    }

                    return res.redirect('/dashboard')
                })
            })
        } catch (err) {
            return res.status(500).send('Unable to log in. Please try again.')
        }
    })

    //logging out
    app.post('/logout', (req, res) => {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).send('Unable to log out. Please try again.')
            }

            res.clearCookie('connect.sid', { path: '/' })
            return res.redirect('/login')
        })
    })

    app.get('/signup', (req, res) => {
        res.render('signup')
    })

    //displaying dashboard, loads users first name
    app.get('/dashboard', async (req, res) => {
        if (!req.session.userId) {
            return res.redirect('/login')
        }

        try {
            const user = await User.findById(req.session.userId)
                .select('firstName')

            if (!user) {
                return res.redirect('/login')
            }

            res.render('dashboard', {
                firstName: user.firstName
            })
        } catch (err) {
            return res.status(500).send('Unable to load your dashboard.')
        }
    })

    app.get('/discover', async (req, res) => {
        if (!req.session.userId) {
            return res.redirect('/login')
        }

        const location = typeof req.query.location === 'string'
            ? req.query.location.trim()
            : ''

        const industry = typeof req.query.industry === 'string'
            ? req.query.industry.trim()
            : ''

        const hasSearched = location !== ''

        let businesses = []
        let error = ''

        if (hasSearched) {
            try {
                const places = await searchBusinesses(location, industry)

                businesses = places.map(place => ({
                    name: place.title || 'Unnamed business',
                    industry: place.type || 'Category not listed',
                    location: place.address || 'Address not listed'
                }))
            } catch (err) {
                error = 'Business search could not be completed. Please try again.'
                res.status(502)
            }
        }

        res.render('discover', {
            businesses: businesses,
            location: location,
            industry: industry,
            hasSearched: hasSearched,
            error: error
        })
    })

    //sending signup data
    app.post('/signup', async (req, res) => {
        const { firstName, lastName, email, password, confirmPassword } = req.body
        const fields = [firstName, lastName, email, password, confirmPassword]
        if (fields.some(value => typeof value !== 'string' || !value.trim())) {
            return res.status(400).send('Please fill out all fields.')
        }

        if (password !== confirmPassword) {
            return res.status(400).send('Passwords do not match.')
        }

        if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
            return res.status(400).send(
                'Use at least 8 characters and no more than 72 bytes for your password.'
            )
        }

        const normalizedEmail = email.trim().toLowerCase()
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            return res.status(400).send('Please enter a valid email address.')
        }

        try {
            const existingUser = await User.findOne({
                email: normalizedEmail
            })

            if (existingUser) {
                return res.status(409).send('An account with this email already exists.')
            }

            const hashedPassword = await bcrypt.hash(password, 12)
            await User.create({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: normalizedEmail,
                password: hashedPassword
            })

            return res.redirect('/login')
        } catch (err) {
            if (err.code === 11000) {
                return res.status(409).send('An account with these details already exists.')
            }

            return res.status(500).send('Unable to create your account. Please try again.')
        }
    })
}