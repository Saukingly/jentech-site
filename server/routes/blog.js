const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireLogin } = require('../middleware/authMiddleware');

router.get('/', async(req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT b.*, u.name AS author_name
       FROM blog_posts b
       LEFT JOIN users u ON b.author_id = u.id
       WHERE b.published = true
       ORDER BY b.published_at DESC`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

router.get('/:slug', async(req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT b.*, u.name AS author_name
       FROM blog_posts b
       LEFT JOIN users u ON b.author_id = u.id
       WHERE b.slug = ? AND b.published = true`, [req.params.slug]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Post not found.' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

router.post('/', requireLogin, async(req, res) => {
    const { title, slug, excerpt, content, category, image_url, published } = req.body;
    if (!title || !slug) return res.status(400).json({ error: 'Title and slug required.' });
    try {
        const publishedAt = published ? new Date() : null;
        const [result] = await db.query(
            `INSERT INTO blog_posts (title, slug, excerpt, content, author_id, category, image_url, published, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [title, slug, excerpt, content, req.session.userId, category, image_url, published || false, publishedAt]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ error: 'Slug already exists.' });
        res.status(500).json({ error: 'Server error.' });
    }
});

router.put('/:id', requireLogin, async(req, res) => {
    const { title, slug, excerpt, content, category, image_url, published } = req.body;
    try {
        const publishedAt = published ? new Date() : null;
        await db.query(
            `UPDATE blog_posts SET title=?, slug=?, excerpt=?, content=?, category=?,
       image_url=?, published=?, published_at=? WHERE id=?`, [title, slug, excerpt, content, category, image_url, published, publishedAt, req.params.id]
        );
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

router.delete('/:id', requireLogin, async(req, res) => {
    try {
        await db.query('DELETE FROM blog_posts WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;