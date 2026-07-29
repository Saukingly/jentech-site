const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireClientLogin } = require('../middleware/authMiddleware');
const { validatePassword } = require('../utils/validation');
const { encrypt, decrypt } = require('../utils/encryption');

// Same service → department mapping used by the public contact form,
// so requests submitted from the portal route the same way.
function departmentForService(service) {
    if (!service) return null;
    if (service === 'Geotechnical Exploration' || service === 'Site Investigation') return 'Geotech Exploration Services';
    if (service === 'Materials & Soils Testing') return 'Jets Laboratories';
    return 'Jentech Consultants';
}

// POST /api/client-portal/request — logged-in client submits a new inquiry.
// Lands in the same contact_submissions table admin sees under Inquiries,
// pre-filled with the client's own name/email so staff know who it's from.
router.post('/request', requireClientLogin, async(req, res) => {
    const { service, message } = req.body;
    if (!message || !message.trim())
        return res.status(400).json({ error: 'Please describe your request.' });

    try {
        const [clientRows] = await db.query('SELECT name, email, company FROM clients WHERE id = ?', [req.session.clientId]);
        if (clientRows.length === 0)
            return res.status(404).json({ error: 'Account not found.' });

        const client = clientRows[0];
        const nameParts = (client.name || '').trim().split(' ');
        const firstName = nameParts[0] || client.name;
        const lastName = nameParts.slice(1).join(' ') || '—';
        const department = departmentForService(service);

        await db.query(
            `INSERT INTO contact_submissions (first_name, last_name, email, office, service, message, department, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`, [firstName, lastName, client.email, client.company || null, service || null, message.trim(), department]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/client-portal/my-requests — everything this client has submitted,
// with its current status (pending/answered), most recent first.
router.get('/my-requests', requireClientLogin, async(req, res) => {
    try {
        const [clientRows] = await db.query('SELECT email FROM clients WHERE id = ?', [req.session.clientId]);
        if (clientRows.length === 0) return res.status(404).json({ error: 'Account not found.' });

        const [rows] = await db.query(
            `SELECT cs.id, cs.service, cs.department, cs.message, cs.status, cs.created_at,
              r.id AS report_id, r.category AS report_category, r.title AS report_title
       FROM contact_submissions cs
       LEFT JOIN reports r ON r.submission_id = cs.id
       WHERE cs.email = ?
       ORDER BY cs.created_at DESC`, [clientRows[0].email]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/client-portal/profile — the logged-in client's own account info
router.get('/profile', requireClientLogin, async(req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT name, email, company, phone FROM clients WHERE id = ?', [req.session.clientId]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Account not found.' });
        const profile = rows[0];
        profile.phone = decrypt(profile.phone);
        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// PUT /api/client-portal/profile — update name/company/phone.
// Email is intentionally not editable here — changing it would need its
// own re-verification flow, which isn't built yet.
router.put('/profile', requireClientLogin, async(req, res) => {
    const { name, company, phone } = req.body;
    if (!name || !name.trim())
        return res.status(400).json({ error: 'Name is required.' });

    try {
        const encryptedPhone = phone ? encrypt(phone) : null;
        await db.query(
            'UPDATE clients SET name = ?, company = ?, phone = ? WHERE id = ?', [name.trim(), company || null, encryptedPhone, req.session.clientId]
        );
        req.session.clientName = name.trim();
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// PUT /api/client-portal/password — change password.
// Requires the current password to be entered correctly first.
router.put('/password', requireClientLogin, async(req, res) => {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password)
        return res.status(400).json({ error: 'Current and new password are both required.' });

    const passwordError = validatePassword(new_password);
    if (passwordError) return res.status(400).json({ error: passwordError });

    try {
        const [rows] = await db.query('SELECT password FROM clients WHERE id = ?', [req.session.clientId]);
        if (rows.length === 0) return res.status(404).json({ error: 'Account not found.' });

        const match = await bcrypt.compare(current_password, rows[0].password);
        if (!match) return res.status(401).json({ error: 'Current password is incorrect.' });

        const hashed = await bcrypt.hash(new_password, 10);
        await db.query('UPDATE clients SET password = ? WHERE id = ?', [hashed, req.session.clientId]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;

