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
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
    .split(',').map(o => o.trim()).filter(Boolean);

app.use('/api', cors({
    origin: (origin, callback) => {
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
const sessionStore = new MySQLStore({
    createDatabaseTable: true,
    expiration: 1000 * 60 * 30,
    clearExpired: true,
    checkExpirationInterval: 1000 * 60 * 15
}, db);
sessionStore.onReady().catch((err) => console.error('Session store failed to connect:', err.message));

const IDLE_TIMEOUT_MINUTES = parseInt(process.env.IDLE_TIMEOUT_MINUTES) || 30;

app.use(session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * IDLE_TIMEOUT_MINUTES
    }
}));

// ---- Admin subdomain isolation ----
const ADMIN_HOSTNAME = process.env.ADMIN_HOSTNAME;
if (ADMIN_HOSTNAME) {
    app.use((req, res, next) => {
        const isAdminPath = req.path.startsWith('/pages/admin');
        const isSharedAsset = req.path.startsWith('/css') || req.path.startsWith('/js') ||
            req.path.startsWith('/images') || req.path.startsWith('/api') || req.path === '/favicon.ico';

        if (req.hostname === ADMIN_HOSTNAME) {
            if (isAdminPath || isSharedAsset) return next();
            return res.redirect('/pages/admin/login.html');
        } else {
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

// ---- Clean detail-page URLs ----
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
// prettier-ignore
app.get(/(.*)/, (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ---- Global error handler ----
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} — ${err.message}`);
    if (res.headersSent) return next(err);
    res.status(err.status || 500).json({ error: 'Server error.' });
});

// ---- Start server ----
// Explicitly binding to '0.0.0.0' allows Railway's proxy to route external traffic
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Jentech server running on port ${PORT}`);
});