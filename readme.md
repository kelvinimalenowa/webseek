# 🎵 Vinyl Room

**Discover music. Share your favorites. Find your next favorite track.**

Vinyl Room is a full-stack music discovery and sharing application where users can recommend songs, explore music shared by others, and upvote their favorite recommendations.

Built with Node.js, Express, MongoDB, and EJS, Vinyl Room integrates the Spotify Web API to automatically retrieve album artwork for shared tracks.

## 🔗 Live Application

[Explore Vinyl Room](https://vinyl-room.onrender.com/)

## 📸 Project Preview

![Vinyl Room Preview](assets/mockup.png)

## Features

- **User Authentication:** Sign up, log in, and access a personal profile.
- **Share Music:** Recommend songs with titles, artists, albums, genres, and personal descriptions.
- **Spotify Integration:** Automatically retrieve album artwork for matching tracks.
- **Music Discovery:** Browse recommendations shared by the community.
- **Upvoting:** Upvote songs, remove votes, and see recommendation scores.
- **Personal Collection:** View and manage your shared recommendations.
- **Post Management:** Delete your own song recommendations.
- **Responsive Design:** Custom dark-themed interface for desktop and mobile.

## Tech Stack

### Frontend
- HTML5
- CSS3
- JavaScript
- EJS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Passport.js

### APIs & Deployment
- Spotify Web API
- MongoDB Atlas

## Credits & Acknowledgments

- **[Glassmorphism Login Form – FreeFrontend](https://freefrontend.com/css-login-forms/#2021-glassmorphism-login-form-tutorial-in-html-css-l)** — The signup pages were adapted from this design, with customized styling to fit Vinyl Room's visual identity.
- **[Bootstrap 5 Gallery Grid – FreeFrontend](https://freefrontend.com/bootstrap-cards/#2025-01-01-bootstrap-5-gallery-grid-l)**: The image-overlay card style for listings was inspired by this design, reworked into a uniform grid with a custom blue-orange theme.
- **[Spotify Web API](https://developer.spotify.com/documentation/web-api)** — Used to retrieve album artwork and track metadata for shared songs.
- The server and routes were self written, while automated assistance was used to help develop some of the EJS pages and CSS. The login/signup styling was also adapted from the FreeFrontend design credited above.

## How It Works

1. **Create an account** to start sharing music.
2. **Share a song** by entering its title, artist, genre, and other details.
3. **Spotify automatically retrieves album artwork** when a matching track is available.
4. **Explore the discovery feed** to find songs shared by other users.
5. **Upvote recommendations** you enjoy, or remove your upvote at any time.
6. **Visit your profile** to view and manage your shared collection.

## Running Locally

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the project root with your own values:
   ```
   MONGODB_URI=your-mongodb-connection-string
   SESSION_SECRET=any-long-random-phrase
   SPOTIFY_ACCESS_KEY=your-spotify-access-key
   ```
3. Start the server and visit `http://localhost:3000`:
   ```bash
   node server.js
   ```

## Future Improvements

- Sort recommendations by most recent or most upvoted.
- Search and filter songs by artist, title, or genre.
- Explore public user profiles and their music collections.
- Improve Spotify track matching for remixes, live versions, and alternate releases.