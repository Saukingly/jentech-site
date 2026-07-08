const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ---- Middleware ----
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ---- Sessions ----
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // set to true when using HTTPS in production
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 8 // 8 hours
    }
}));

// ---- Serve frontend files ----
app.use(express.static(path.join(__dirname, '../public')));

// ---- API Routes ----
app.use('/api/auth', require('./routes/auth'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/projects', require('./routes/projects'));
app.use('/api/services', require('./routes/services'));
app.use('/api/team', require('./routes/team'));
app.use('/api/blog', require('./routes/blog'));
app.use('/api/client-auth', require('./routes/clientAuth'));
app.use('/api/client-portal', require('./routes/clientPortal'));
app.use('/api/clients', require('./routes/clients'));

// ---- Catch-all: serve index.html for any unmatched route ----
// Update this route at the bottom of server.js
app.get('/{/*path}', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ---- Start server ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Jentech server running at http://localhost:${PORT}`);
});