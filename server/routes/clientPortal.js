const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireClientLogin } = require('../middleware/authMiddleware');

// GET /api/client-portal/project — the logged-in client's own project
router.get('/project', requireClientLogin, async(req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT cp.*, c.name AS client_name, c.company, c.email
       FROM client_projects cp
       JOIN clients c ON c.id = cp.client_id
       WHERE cp.client_id = ?`, [req.session.clientId]
        );
        if (rows.length === 0)
            return res.status(404).json({ error: 'No project found for this account.' });
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;