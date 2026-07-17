const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/authMiddleware');

// Maps the service a visitor selects on the contact form to the company that
// actually handles that kind of work. Must match the <option> values in
// public/pages/contact/index.html exactly.
function departmentForService(service) {
    if (!service) return null;
    if (service === 'Geotechnical Exploration' || service === 'Site Investigation') return 'Geotech Exploration Services';
    if (service === 'Materials & Soils Testing') return 'Jets Laboratories';
    return 'Jentech Consultants'; // Civil & Structural Engineering, Project Management, Other
}

// POST /api/contact  — public, saves form submission
router.post('/', async(req, res) => {
    const { first_name, last_name, email, office, service, message } = req.body;
    if (!first_name || !last_name || !email || !message)
        return res.status(400).json({ error: 'Required fields missing.' });

    // Normalized (trimmed + lowercased) so this always matches a client's
    // account email later, regardless of how either was typed/cased.
    const normalizedEmail = email.trim().toLowerCase();

    const department = departmentForService(service);

    try {
        await db.query(
            `INSERT INTO contact_submissions
       (first_name, last_name, email, office, service, message, department, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`, [first_name, last_name, normalizedEmail, office || null, service || null, message, department]
        );
        res.json({ success: true, message: 'Message received! We will be in touch.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/contact  — staff: get submissions. Admins see everything;
// department accounts only see inquiries routed to their own company.
router.get('/', requireLogin, async(req, res) => {
    try {
        let rows;
        if (req.session.role === 'admin' || !req.session.department) {
            [rows] = await db.query('SELECT * FROM contact_submissions ORDER BY created_at DESC');
        } else {
            [rows] = await db.query(
                'SELECT * FROM contact_submissions WHERE department = ? ORDER BY created_at DESC', [req.session.department]
            );
        }
        res.json(rows);
    } catch (err) {
        console.error(err);
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

// PATCH /api/contact/:id/status — mark pending/answered
router.patch('/:id/status', requireLogin, async(req, res) => {
    const { status } = req.body;
    if (!['pending', 'answered'].includes(status))
        return res.status(400).json({ error: 'Invalid status.' });
    try {
        await db.query('UPDATE contact_submissions SET status = ? WHERE id = ?', [status, req.params.id]);
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