const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const db = require('./db');

const app = express();

// Personalized API responses (client portal, admin dashboard, etc.) should
// never be conditionally cached — disable Express's default ETag generation
// so these routes always return a fresh 200 instead of a 304 with no body.
app.set('etag', false);

// ---- CORS: allowlist specific origins instead of reflecting any origin ----
// Add your real production domain(s) to ALLOWED_ORIGINS in .env once deployed,
// comma-separated, e.g. ALLOWED_ORIGINS=https://jentechgroup.com
<<<<<<< HEAD
// Scoped to /api only — static pages/CSS/JS never need CORS checks, and
// keeping this scoped avoids it ever interfering with normal page loads.
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',').map(o => o.trim()).filter(Boolean);

app.use('/api', cors({
=======
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',').map(o => o.trim()).filter(Boolean);

app.use(cors({
>>>>>>> 65689711e64d3c199835421fb6806fb0f1d51d26
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
// Stored in MySQL (your existing database — no new infrastructure needed)
// instead of server memory, so logins survive server restarts/redeploys.
const sessionStore = new MySQLStore({
    createDatabaseTable: true, // auto-creates the `sessions` table on first run
    expiration: 1000 * 60 * 30, // matches cookie maxAge below
    clearExpired: true,
    checkExpirationInterval: 1000 * 60 * 15 // sweep expired sessions every 15 min
}, db);
sessionStore.onReady().catch((err) => console.error('Session store failed to connect:', err.message));

// IDLE_TIMEOUT_MINUTES controls how long someone can sit inactive before
// being signed out automatically. `rolling: true` resets this clock on every
// request, so it never affects someone actively using the site — only
// genuine inactivity triggers it.
const IDLE_TIMEOUT_MINUTES = parseInt(process.env.IDLE_TIMEOUT_MINUTES) || 30;

app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true once deployed behind HTTPS
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * IDLE_TIMEOUT_MINUTES
    }
}));

// ---- Admin subdomain isolation ----
// Set ADMIN_HOSTNAME in .env once you have a real domain (e.g.
// ADMIN_HOSTNAME=admin.jentechgroup.com) to move the admin panel off your
// main site entirely: it becomes reachable ONLY at that subdomain, and
// completely unreachable (404) from your main domain. Leave it unset for
// local development — this whole block does nothing until it's configured,
// so it can't break anything you're testing locally right now.
const ADMIN_HOSTNAME = process.env.ADMIN_HOSTNAME;
if (ADMIN_HOSTNAME) {
    app.use((req, res, next) => {
        const isAdminPath = req.path.startsWith('/pages/admin');
        const isSharedAsset = req.path.startsWith('/css') || req.path.startsWith('/js') ||
            req.path.startsWith('/images') || req.path.startsWith('/api') || req.path === '/favicon.ico';

        if (req.hostname === ADMIN_HOSTNAME) {
            // On the admin subdomain: only admin pages, shared assets, and the API are reachable.
            if (isAdminPath || isSharedAsset) return next();
            return res.redirect('/pages/admin/login.html');
        } else {
            // On the main domain: the admin panel no longer exists here at all.
            if (isAdminPath) return res.status(404).send('Not found');
            return next();
        }
    });
}

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

<<<<<<< HEAD
// ---- Global error handler ----
// Catches anything that gets thrown/passed to next() anywhere above
// (including CORS rejections) and returns a clean response instead of a
// raw stack trace. Logs a short one-line message to the terminal instead
// of the full trace, so real problems are still visible but not noisy.
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} — ${err.message}`);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({ error: 'Server error.' });
});

// ---- Start server ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Jentech server running at http://localhost:${PORT}`);
=======
// ---- Start server ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Jentech running at http://localhost:${PORT}`);
>>>>>>> 65689711e64d3c199835421fb6806fb0f1d51d26
});