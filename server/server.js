const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Personalized API responses (client portal, admin dashboard, etc.) should
// never be conditionally cached — disable Express's default ETag generation
// so these routes always return a fresh 200 instead of a 304 with no body.
app.set('etag', false);

// ---- CORS: allowlist specific origins instead of reflecting any origin ----
// Add your real production domain(s) to ALLOWED_ORIGINS in .env once deployed,
// comma-separated, e.g. ALLOWED_ORIGINS=https://jentechgroup.com
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow same-origin/non-browser requests (no Origin header) and anything
        // explicitly allowlisted. Anything else is rejected.
        if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

// ---- Basic security headers (no extra dependency needed) ----
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
    }
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', (req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});

// ---- Sessions ----
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true once deployed behind HTTPS
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 8 // 8 hours
    }
}));

// ---- Serve frontend files ----
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
app.use('/api/reports', require('./routes/reports'));

// ---- Clean detail-page URLs (e.g. /pages/services/civil-structural-engineering) ----
// express.static above already handles any real file (index.html, CSS, JS),
// so these only fire for an actual slug that doesn't match a file on disk.
app.get('/pages/services/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/services/detail.html'));
});
app.get('/pages/blog/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/blog/detail.html'));
});
app.get('/pages/projects/:slug', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/pages/projects/detail.html'));
});

// ---- Catch-all: serve index.html for any unmatched route ----
// Update this route at the bottom of server.js
app.get('/{/*path}', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ---- Start server ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Jentech running at http://localhost:${PORT}`);
});