const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/authMiddleware');

// POST /api/contact  — public, saves form submission
router.post('/', async(req, res) => {
    const { first_name, last_name, email, office, service, message } = req.body;
    if (!first_name || !last_name || !email || !message)
        return res.status(400).json({ error: 'Required fields missing.' });

    try {
        await db.query(
            `INSERT INTO contact_submissions
       (first_name, last_name, email, office, service, message)
       VALUES (?, ?, ?, ?, ?, ?)`, [first_name, last_name, email, office || null, service || null, message]
        );
        res.json({ success: true, message: 'Message received! We will be in touch.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/contact  — admin: get all submissions
router.get('/', requireLogin, async(req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM contact_submissions ORDER BY created_at DESC'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// PATCH /api/contact/:id/read  — mark as read
router.patch('/:id/read', requireLogin, async(req, res) => {
    try {
        await db.query(
            'UPDATE contact_submissions SET read_status = true WHERE id = ?', [req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// DELETE /api/contact/:id
router.delete('/:id', requireLogin, async(req, res) => {
    try {
        await db.query('DELETE FROM contact_submissions WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;