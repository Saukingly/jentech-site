const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const db = require('../db');
const { sendVerificationEmail } = require('../utils/mailer');
const { validatePassword } = require('../utils/validation');
const { encrypt } = require('../utils/encryption');
const { loginLimiter, signupLimiter } = require('../middleware/rateLimiter');

function baseUrl(req) {
    return `${req.protocol}://${req.get('host')}`;
}

// POST /api/client-auth/register — public signup for clients.
// Account is created unverified; they must click the emailed link before
// they can log in.
router.post('/register', signupLimiter, async(req, res) => {
    const { name, email, password, company, phone, website, privacy_accepted } = req.body;

    // Honeypot: a real person never sees or fills this field (hidden via CSS
    // on the form); a bot filling every field it finds will fill it. Pretend
    // success without actually creating anything or sending an email, so
    // the bot doesn't learn it was caught.
    if (website) return res.json({ success: true, needsVerification: true });

    if (!name || !email || !password)
        return res.status(400).json({ error: 'Name, email and password are required.' });

    if (!privacy_accepted)
        return res.status(400).json({ error: 'You must accept the Privacy Policy to create an account.' });

    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ error: passwordError });

    const normalizedEmail = email.trim().toLowerCase();

    try {
        const hashed = await bcrypt.hash(password, 10);
        const encryptedPhone = phone ? encrypt(phone) : null;
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        const [result] = await db.query(
            `INSERT INTO clients (name, email, password, company, phone, email_verified, verification_token, verification_expires, privacy_accepted_at)
       VALUES (?, ?, ?, ?, ?, FALSE, ?, ?, NOW())`, [name, normalizedEmail, hashed, company || null, encryptedPhone, token, expires]
        );

        await db.query(
            'INSERT INTO client_projects (client_id, project_name) VALUES (?, ?)', [result.insertId, 'Your project']
        );

        const verifyUrl = `${baseUrl(req)}/api/client-auth/verify?token=${token}`;
        try {
            await sendVerificationEmail(normalizedEmail, name, verifyUrl);
        } catch (mailErr) {
            console.error('Verification email failed to send:', mailErr.message);
            // Account still exists — they can use "resend verification" later.
        }

        res.json({ success: true, needsVerification: true });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ error: 'An account with that email already exists.' });
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/client-auth/verify?token=...  — clicked from the emailed link.
// Marks the account verified, logs them straight in, and sends them to the portal.
router.get('/verify', async(req, res) => {
    const { token } = req.query;
    if (!token) return res.redirect('/pages/client/login.html?verify=missing');

    try {
        const [rows] = await db.query(
            'SELECT * FROM clients WHERE verification_token = ? AND verification_expires > NOW()', [token]
        );
        if (rows.length === 0)
            return res.redirect('/pages/client/login.html?verify=expired');

        const client = rows[0];
        await db.query(
            'UPDATE clients SET email_verified = TRUE, verification_token = NULL, verification_expires = NULL WHERE id = ?', [client.id]
        );

        req.session.regenerate((err) => {
            if (err) {
                console.error(err);
                return res.redirect('/pages/client/login.html?verify=error');
            }
            req.session.clientId = client.id;
            req.session.clientName = client.name;
            res.redirect('/pages/client/portal.html');
        });
    } catch (err) {
        console.error(err);
        res.redirect('/pages/client/login.html?verify=error');
    }
});

// POST /api/client-auth/resend-verification
router.post('/resend-verification', signupLimiter, async(req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const normalizedEmail = email.trim().toLowerCase();

    try {
        const [rows] = await db.query('SELECT * FROM clients WHERE email = ?', [normalizedEmail]);
        // Same response whether or not the account exists / is already verified —
        // avoids leaking which emails have accounts.
        if (rows.length === 0 || rows[0].email_verified) {
            return res.json({ success: true });
        }

        const client = rows[0];
        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await db.query(
            'UPDATE clients SET verification_token = ?, verification_expires = ? WHERE id = ?', [token, expires, client.id]
        );

        const verifyUrl = `${baseUrl(req)}/api/client-auth/verify?token=${token}`;
        await sendVerificationEmail(client.email, client.name, verifyUrl);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/client-auth/login
router.post('/login', loginLimiter, async(req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Email and password are required.' });

    try {
        const [rows] = await db.query('SELECT * FROM clients WHERE email = ?', [email.trim().toLowerCase()]);
        if (rows.length === 0)
            return res.status(401).json({ error: 'Invalid email or password.' });

        const client = rows[0];
        const match = await bcrypt.compare(password, client.password);
        if (!match)
            return res.status(401).json({ error: 'Invalid email or password.' });

        if (!client.email_verified)
            return res.status(403).json({ error: 'Please verify your email before logging in.', needsVerification: true });

        req.session.regenerate((err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Server error.' });
            }
            req.session.clientId = client.id;
            req.session.clientName = client.name;
            res.json({ success: true, name: client.name });
        });
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
router.get('/me', async(req, res) => {
    if (req.session && req.session.clientId) {
        try {
            const [rows] = await db.query('SELECT company FROM clients WHERE id = ?', [req.session.clientId]);
            const company = rows.length ? rows[0].company : null;
            res.json({ loggedIn: true, name: req.session.clientName, company: company || null });
        } catch (err) {
            res.json({ loggedIn: true, name: req.session.clientName, company: null });
        }
    } else {
        res.json({ loggedIn: false });
    }
});

module.exports = router;