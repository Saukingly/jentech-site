const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

// POST /api/auth/login
router.post('/login', async(req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Email and password are required.' });

    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0)
            return res.status(401).json({ error: 'Invalid email or password.' });

        const user = rows[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(401).json({ error: 'Invalid email or password.' });

        // Save session
        req.session.userId = user.id;
        req.session.name = user.name;
        req.session.role = user.role;

        res.json({ success: true, name: user.name, role: user.role });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

// GET /api/auth/me  
router.get('/me', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({ loggedIn: true, name: req.session.name, role: req.session.role });
    } else {
        res.json({ loggedIn: false });
    }
});

// POST /api/auth/register  (public signup — always creates an 'editor' account.
// The role is intentionally NEVER read from the request body — otherwise anyone
// could POST { role: 'admin' } and grant themselves full admin access. Promote
// an account to 'admin' manually in the database if needed.)
router.post('/register', async(req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ error: 'All fields required.' });

    try {
        const hashed = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', [name, email, hashed, 'editor']
        );
        res.json({ success: true });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ error: 'Email already in use.' });
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;