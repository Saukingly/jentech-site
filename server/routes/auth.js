const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireAdmin } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');

// POST /api/auth/login
router.post('/login', loginLimiter, async(req, res) => {
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

        // Regenerate the session ID on login so a session ID issued before
        // authentication can never become a valid authenticated session
        // (session fixation protection).
        req.session.regenerate((err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Server error.' });
            }
            req.session.userId = user.id;
            req.session.name = user.name;
            req.session.role = user.role;
            req.session.department = user.department || null;
            res.json({ success: true, name: user.name, role: user.role, department: user.department || null });
        });
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

// GET /api/auth/me  — check if logged in
router.get('/me', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({ loggedIn: true, name: req.session.name, role: req.session.role, department: req.session.department || null });
    } else {
        res.json({ loggedIn: false });
    }
});

// POST /api/auth/register  (ADMIN ONLY — creates a staff account for one of the
// three companies. There is no public signup for staff anymore: department
// accounts are created here by an existing admin.)
router.post('/register', requireAdmin, async(req, res) => {
    const { name, email, password, role, department } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ error: 'All fields required.' });

    const finalRole = role === 'admin' ? 'admin' : 'editor';
    // Admins can see everything (no department); editors must belong to one company.
    const finalDepartment = finalRole === 'admin' ? null : (department || null);

    try {
        const hashed = await bcrypt.hash(password, 10);
        await db.query(
            'INSERT INTO users (name, email, password, role, department) VALUES (?, ?, ?, ?, ?)', [name, email, hashed, finalRole, finalDepartment]
        );
        res.json({ success: true });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ error: 'Email already in use.' });
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/auth/staff — admin only: list all staff accounts
router.get('/staff', requireAdmin, async(req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT id, name, email, role, department, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// PUT /api/auth/staff/:id — admin only: edit a staff account
router.put('/staff/:id', requireAdmin, async(req, res) => {
    const { name, email, password, role, department } = req.body;
    const finalRole = role === 'admin' ? 'admin' : 'editor';
    const finalDepartment = finalRole === 'admin' ? null : (department || null);
    try {
        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            await db.query(
                'UPDATE users SET name=?, email=?, role=?, department=?, password=? WHERE id=?', [name, email, finalRole, finalDepartment, hashed, req.params.id]
            );
        } else {
            await db.query(
                'UPDATE users SET name=?, email=?, role=?, department=? WHERE id=?', [name, email, finalRole, finalDepartment, req.params.id]
            );
        }
        res.json({ success: true });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ error: 'Email already in use.' });
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// DELETE /api/auth/staff/:id — admin only
router.delete('/staff/:id', requireAdmin, async(req, res) => {
    if (parseInt(req.params.id) === req.session.userId)
        return res.status(400).json({ error: "You can't delete your own account while logged in." });
    try {
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;