const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin, requireClientLogin } = require('../middleware/authMiddleware');

// GET /api/reports — staff: list reports. Admins see all; department
// accounts only see reports created for their own company.
router.get('/', requireLogin, async(req, res) => {
    try {
        let rows;
        if (req.session.role === 'admin' || !req.session.department) {
            [rows] = await db.query('SELECT * FROM reports ORDER BY created_at DESC');
        } else {
            [rows] = await db.query(
                'SELECT * FROM reports WHERE department = ? ORDER BY created_at DESC', [req.session.department]
            );
        }
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/reports — staff: create a report replying to an inquiry.
// If submission_id is given, that inquiry is auto-marked as answered..
router.post('/', requireLogin, async(req, res) => {
    const { submission_id, client_email, department, category, title, notes, amount, file_url } = req.body;
    if (!client_email || !category || !title)
        return res.status(400).json({ error: 'Client email, category, and title are required.' });

    try {
        await db.query(
            `INSERT INTO reports (submission_id, client_email, department, category, title, notes, amount, file_url, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                submission_id || null, client_email, department || req.session.department || null,
                category, title, notes || null, amount || null, file_url || null, req.session.userId
            ]
        );
        if (submission_id) {
            await db.query('UPDATE contact_submissions SET status = ? WHERE id = ?', ['answered', submission_id]);
        }
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// DELETE /api/reports/:id — staff
router.delete('/:id', requireLogin, async(req, res) => {
    try {
        await db.query('DELETE FROM reports WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/reports/mine — client portal: the logged-in client's own reports,
// matched by email (works even for reports created before their account existed)
router.get('/mine', requireClientLogin, async(req, res) => {
    try {
        const [clientRows] = await db.query('SELECT email FROM clients WHERE id = ?', [req.session.clientId]);
        if (clientRows.length === 0) return res.json([]);
        const [rows] = await db.query(
            'SELECT * FROM reports WHERE client_email = ? ORDER BY created_at DESC', [clientRows[0].email]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;