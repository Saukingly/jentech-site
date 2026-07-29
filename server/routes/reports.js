const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');
const { applyWatermark } = require('../utils/watermark');
const { requireLogin, requireClientLogin } = require('../middleware/authMiddleware');

// ---- File upload setup ----
// Reports can carry one attached file (PDF, image, or Word doc) that gets
// stored on disk under server/uploads/reports and served statically.
const uploadDir = path.join(__dirname, '../uploads/reports');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `${Date.now()}-${safeName}`);
    }
});

const ALLOWED_TYPES = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png'];
const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ALLOWED_TYPES.includes(ext)) cb(null, true);
        else cb(new Error('File type not allowed. Use PDF, Word, Excel, or an image.'));
    }
});

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
// If submission_id is given, that inquiry is auto-marked as answered.
// Accepts multipart/form-data so an actual file can be attached.
router.post('/', requireLogin, (req, res, next) => {
    upload.single('file')(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        next();
    });
}, async(req, res) => {
    const { submission_id, client_email, department, category, title, notes, amount, file_url } = req.body;
    if (!client_email || !category || !title)
        return res.status(400).json({ error: 'Client email, category, and title are required.' });

    const normalizedEmail = client_email.trim().toLowerCase();
    // Prefer an actually-uploaded file; fall back to a manually typed URL if given.
    const finalFileUrl = req.file ? `/uploads/reports/${req.file.filename}` : (file_url || null);

    if (req.file) {
        await applyWatermark(req.file.path, req.file.mimetype);
    }

    try {
        await db.query(
            `INSERT INTO reports (submission_id, client_email, department, category, title, notes, amount, file_url, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                submission_id || null, normalizedEmail, department || req.session.department || null,
                category, title, notes || null, amount || null, finalFileUrl, req.session.userId
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
        const [rows] = await db.query('SELECT file_url, department FROM reports WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Not found.' });
        if (req.session.role !== 'admin' && req.session.department && rows[0].department !== req.session.department) {
            return res.status(403).json({ error: 'You can only manage reports for your own department.' });
        }
        await db.query('DELETE FROM reports WHERE id = ?', [req.params.id]);
        if (rows[0].file_url && rows[0].file_url.startsWith('/uploads/reports/')) {
            const filePath = path.join(__dirname, '..', rows[0].file_url);
            fs.unlink(filePath, () => {}); // best-effort, ignore errors
        }
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
