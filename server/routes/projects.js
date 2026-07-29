const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/authMiddleware');

// GET /api/projects  — public
router.get('/', async(req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM projects WHERE published = true ORDER BY year DESC, created_at DESC'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/projects/:slug  — public, single project
router.get('/:slug', async(req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM projects WHERE slug = ? AND published = true', [req.params.slug]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Project not found.' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/projects  — admin: create
router.post('/', requireLogin, async(req, res) => {
    const { title, slug, location, service_type, short_desc, full_desc, image_url, year, featured } = req.body;
    if (!title || !slug) return res.status(400).json({ error: 'Title and slug required.' });
    try {
        const [result] = await db.query(
            `INSERT INTO projects (title, slug, location, service_type, short_desc, full_desc, image_url, year, featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [title, slug, location, service_type, short_desc, full_desc, image_url, year, featured || false]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ error: 'Slug already exists.' });
        res.status(500).json({ error: 'Server error.' });
    }
});

// PUT /api/projects/:id  — admin: update
router.put('/:id', requireLogin, async(req, res) => {
    const { title, slug, location, service_type, short_desc, full_desc, image_url, year, featured, published } = req.body;
    try {
        await db.query(
            `UPDATE projects SET title=?, slug=?, location=?, service_type=?, short_desc=?,
       full_desc=?, image_url=?, year=?, featured=?, published=? WHERE id=?`, [title, slug, location, service_type, short_desc, full_desc, image_url, year, featured, published, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

// DELETE /api/projects/:id  — admin
router.delete('/:id', requireLogin, async(req, res) => {
    try {
        await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;