const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/authMiddleware');

// GET /api/team — Public: Get all published team members
router.get('/', async(req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM team WHERE published = true ORDER BY id ASC'
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/team/:slug — Public: Get a single team member's details
router.get('/:slug', async(req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM team WHERE slug = ? AND published = true', [req.params.slug]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Team member not found.' });
        }
        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/team — Admin only: Create a new team member
router.post('/', requireLogin, async(req, res) => {
    const { name, slug, role, office, bio, email, linkedin, image_url, published } = req.body;

    if (!name || !slug) {
        return res.status(400).json({ error: 'Name and slug are required.' });
    }

    try {
        const [result] = await db.query(
            `INSERT INTO team (name, slug, role, office, bio, email, linkedin, image_url, published) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [name, slug, role, office, bio, email, linkedin, image_url, published || false]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Slug already exists.' });
        }
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// PUT /api/team/:id — Admin only: Update an existing team member
router.put('/:id', requireLogin, async(req, res) => {
    const { name, slug, role, office, bio, email, linkedin, image_url, published } = req.body;

    try {
        await db.query(
            `UPDATE team SET name=?, slug=?, role=?, office=?, bio=?, email=?, linkedin=?, image_url=?, published=? 
             WHERE id=?`, [name, slug, role, office, bio, email, linkedin, image_url, published, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// DELETE /api/team/:id — Admin only: Delete a team member
router.delete('/:id', requireLogin, async(req, res) => {
    try {
        await db.query('DELETE FROM team WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;