const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');

// POST /api/client-auth/register — public signup for clients
router.post('/register', async(req, res) => {
    const { name, email, password, company, phone } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ error: 'Name, email and password are required.' });

    try {
        const hashed = await bcrypt.hash(password, 10);
        const [result] = await db.query(
            'INSERT INTO clients (name, email, password, company, phone) VALUES (?, ?, ?, ?, ?)', [name, email, hashed, company || null, phone || null]
        );

        // Gives the new client an empty project shell so the portal has something to show
        await db.query(
            'INSERT INTO client_projects (client_id, project_name) VALUES (?, ?)', [result.insertId, 'Your project']
        );

        req.session.clientId = result.insertId;
        req.session.clientName = name;
        res.json({ success: true, name });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ error: 'An account with that email already exists.' });
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/client-auth/login
router.post('/login', async(req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Email and password are required.' });

    try {
        const [rows] = await db.query('SELECT * FROM clients WHERE email = ?', [email]);
        if (rows.length === 0)
            return res.status(401).json({ error: 'Invalid email or password.' });

        const client = rows[0];
        const match = await bcrypt.compare(password, client.password);
        if (!match)
            return res.status(401).json({ error: 'Invalid email or password.' });

        req.session.clientId = client.id;
        req.session.clientName = client.name;
        res.json({ success: true, name: client.name });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/client-auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

// GET /api/client-auth/me
router.get('/me', (req, res) => {
    if (req.session && req.session.clientId) {
        res.json({ loggedIn: true, name: req.session.clientName });
    } else {
        res.json({ loggedIn: false });
    }
});

module.exports = router;