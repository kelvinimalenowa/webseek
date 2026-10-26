const bcrypt = require('bcrypt')
const Song = require('./models/song')
const User = require('./models/user')
const { searchSpotifyTrack } = require('../config/spotify')

module.exports = function (app, passport) {

    // normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', async (req, res) => {
        try {
            const songs = await Song.find()
                .populate('user', 'username')
                .sort({ createdAt: -1 })
                .lean()

            res.render('index', {
                songs,
                currentUser: req.user || null
            })

        } catch (err) {
            console.error(err)
            res.status(500).send('Unable to load songs.')
        }
    })

    // PROFILE SECTION =========================
    //display user profile and their songs
    app.get('/profile', async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.redirect('/login')
        }

        try {
            const songs = await Song.find({
                user: req.user._id
            }).sort({ createdAt: -1 }).lean()

            res.render('profile', {
                user: req.user,
                songs
            })

        } catch (err) {
            console.error(err)
            res.status(500).send('Unable to load profile.')
        }
    })

    // LOGOUT ==============================
    app.post('/logout', (req, res, next) => {
        req.logout(err => {
            if (err) {
                return next(err)
            }

            req.session.destroy(err => {
                if (err) {
                    return next(err)
                }

                res.clearCookie('connect.sid')
                res.redirect('/')
            })
        })
    })

    // song routes ==============================================================
    //create a new song
    app.post('/songs', async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.redirect('/login');
        }
        try {
            const { title, artist, album, genre, description } = req.body;

            let spotifyData = null;

            try {
                spotifyData = await searchSpotifyTrack(title, artist);
            } catch (error) {
                console.error('Spotify lookup failed:', error.message);
            }

            const song = await Song.create({
                title,
                artist,
                album,
                genre,
                description,
                user: req.user._id,
                albumArt: spotifyData?.albumArt || null,
                spotifyId: spotifyData?.spotifyId || null,
                spotifyUrl: spotifyData?.spotifyUrl || null
            });

            res.redirect(`/songs/${song._id}`);
        } catch (error) {
            console.error('Error creating song:', error);
            res.status(500).send('Something went wrong while sharing your song.');
        }
    });

    //display Add Song page
    app.get('/songs/new', (req, res) => {
        if (!req.isAuthenticated()) {
            return res.redirect('/login')
        }

        res.render('new-song')
    })

    //liking a song post
    app.post('/songs/:id/upvote', async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.redirect('/login');
        }

        try {
            const song = await Song.findById(req.params.id);

            if (!song) {
                return res.status(404).send('Song not found');
            }

            const userId = req.user._id;

            const alreadyUpvoted = song.upvotes.some(
                id => id.equals(userId)
            );

            if (alreadyUpvoted) {
                song.upvotes.pull(userId);
            } else {
                song.upvotes.addToSet(userId);
            }

            await song.save();

            if (req.get('Accept')?.includes('application/json')) {
                return res.json({
                    upvotes: song.upvotes.length,
                    upvoted: !alreadyUpvoted
                });
            }

            return res.redirect(`/songs/${song._id}`);
        } catch (error) {
            console.error('Error updating upvote:', error);
            return res.status(500).send('Could not update upvote.');
        }
    });

    //display individual song
    app.get('/songs/:id', async (req, res) => {
        try {
            const song = await Song.findById(req.params.id)
                .populate('user', 'username')
                .lean()

            if (!song) {
                return res.status(404).send('Song not found.')
            }

            res.render('show-song', {
                song,
                currentUser: req.user || null
            })

        } catch (err) {
            console.error(err)
            res.status(400).send('Unable to load song.')
        }
    })

    //show the edit form
    app.get('/songs/:id/edit', async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.redirect('/login')
        }

        try {
            const song = await Song.findOne({
                _id: req.params.id,
                user: req.user._id
            }).lean()

            if (!song) {
                return res.status(404).send('Song not found.')
            }

            res.render('edit-song', { song })

        } catch (err) {
            console.error(err)
            res.status(400).send('Unable to load song.')
        }
    })

    //update song
    app.put('/songs/:id', async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.redirect('/login')
        }

        try {
            const { title, artist, album, genre, description } = req.body

            if (!title?.trim() || !artist?.trim() || !genre?.trim()) {
                return res.status(400).send('Title, artist, and genre are required.')
            }

            const song = await Song.findOneAndUpdate(
                {
                    _id: req.params.id,
                    user: req.user._id
                },
                {
                    title,
                    artist,
                    album,
                    genre,
                    description
                },
                {
                    new: true,
                    runValidators: true
                }
            )

            if (!song) {
                return res.status(404).send('Song not found.')
            }

            res.redirect(`/songs/${song._id}`)

        } catch (err) {
            console.error(err)
            res.status(400).send('Unable to update song.')
        }
    })

    //delete a song
    app.delete('/songs/:id', async (req, res) => {
        if (!req.isAuthenticated()) {
            return res.redirect('/login')
        }

        try {
            const song = await Song.findOneAndDelete({
                _id: req.params.id,
                user: req.user._id
            })

            if (!song) {
                return res.status(404).send('Song not found.')
            }

            res.redirect('/profile')

        } catch (err) {
            console.error(err)
            res.status(400).send('Unable to delete song.')
        }
    })

    // =============================================================================
    // AUTHENTICATE (FIRST LOGIN) ==================================================
    // =============================================================================

    // LOGIN ===============================
    // show the login form
    app.get('/login', (req, res) => {
        if (req.isAuthenticated()) {
            return res.redirect('/profile')
        }

        res.render('login')
    })

    // process the login form
    app.post('/login', passport.authenticate('local', {
        successRedirect: '/profile', // redirect to the secure profile section
        failureRedirect: '/login', // redirect back to the signup page if there is an error
    }));

    // SIGNUP =================================
    // show the signup form
    app.get('/signup', (req, res) => {
        res.render('signup')
    })

    // process the signup form
    app.post('/signup', async (req, res) => {
        try {
            const { username, email, password } = req.body

            if (!username?.trim() || !email?.trim() || !password) {
                return res.status(400).send('All fields are required.')
            }

            const normalizedEmail = email.trim().toLowerCase()
            const normalizedUsername = username.trim()

            //check whether the account already exists
            const existingUser = await User.findOne({
                $or: [
                    { email: normalizedEmail },
                    { username: normalizedUsername }
                ]
            })

            if (existingUser) {
                return res.status(400).send('Email or username already in use.')
            }

            //hash password before saving
            const hashedPassword = await bcrypt.hash(password, 12)

            //save user to MongoDB
            await User.create({
                username: normalizedUsername,
                email: normalizedEmail,
                password: hashedPassword
            })

            res.redirect('/login')

        } catch (err) {
            console.error(err)

            if (err.code === 11000) {
                return res.status(400).send('Email or username already in use.')
            }

            res.status(500).send('Something went wrong creating your account.')
        }
    })

};