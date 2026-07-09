const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireClientLogin } = require('../middleware/authMiddleware');

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

module.exports = router;