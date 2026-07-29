const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/authMiddleware');

router.get('/', async(req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM services WHERE published = true ORDER BY display_order ASC'
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

router.get('/:slug', async(req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM services WHERE slug = ? AND published = true', [req.params.slug]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Service not found.' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

router.post('/', requireLogin, async(req, res) => {
    const { title, slug, short_desc, full_desc, icon, display_order } = req.body;
    if (!title || !slug) return res.status(400).json({ error: 'Title and slug required.' });
    try {
        const [result] = await db.query(
            'INSERT INTO services (title, slug, short_desc, full_desc, icon, display_order) VALUES (?, ?, ?, ?, ?, ?)', [title, slug, short_desc, full_desc, icon, display_order || 0]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ error: 'Slug already exists.' });
        res.status(500).json({ error: 'Server error.' });
    }
});

router.put('/:id', requireLogin, async(req, res) => {
    const { title, slug, short_desc, full_desc, icon, display_order, published } = req.body;
    try {
        await db.query(
            'UPDATE services SET title=?, slug=?, short_desc=?, full_desc=?, icon=?, display_order=?, published=? WHERE id=?', [title, slug, short_desc, full_desc, icon, display_order, published, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

router.delete('/:id', requireLogin, async(req, res) => {
    try {
        await db.query('DELETE FROM services WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;