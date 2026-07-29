const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db');
const { requireAdmin } = require('../middleware/authMiddleware');
const { encrypt, decrypt } = require('../utils/encryption');

// GET /api/clients — list all client accounts + their project (admin only)
router.get('/', requireAdmin, async(req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT c.id, c.name, c.email, c.company, c.phone, c.created_at,
              cp.project_name, cp.phase, cp.completion_percent,
              cp.next_milestone_label, cp.next_milestone_date,
              cp.status, cp.sheet_ref, cp.hero_image_url
       FROM clients c
       LEFT JOIN client_projects cp ON cp.client_id = c.id
       ORDER BY c.created_at DESC`
        );
        rows.forEach(r => { r.phone = decrypt(r.phone); });
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/clients — create a client account + project (admin only)
router.post('/', requireAdmin, async(req, res) => {
    const {
<<<<<<< HEAD
        name, email, password, company, phone,
        project_name, phase, completion_percent,
        next_milestone_label, next_milestone_date, status, sheet_ref, hero_image_url
=======
        name,
        email,
        password,
        company,
        phone,
        project_name,
        phase,
        completion_percent,
        next_milestone_label,
        next_milestone_date,
        status,
        sheet_ref,
        hero_image_url
>>>>>>> 65689711e64d3c199835421fb6806fb0f1d51d26
    } = req.body;

    if (!name || !email || !password)
        return res.status(400).json({ error: 'Name, email and password are required.' });

    try {
        const hashed = await bcrypt.hash(password, 10);
        const encryptedPhone = phone ? encrypt(phone) : null;
        const [result] = await db.query(
            'INSERT INTO clients (name, email, password, company, phone) VALUES (?, ?, ?, ?, ?)', [name, email, hashed, company || null, encryptedPhone]
        );
        await db.query(
            `INSERT INTO client_projects
        (client_id, project_name, phase, completion_percent, next_milestone_label, next_milestone_date, status, sheet_ref, hero_image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                result.insertId, project_name || 'Untitled project', phase || null,
                completion_percent || 0, next_milestone_label || null, next_milestone_date || null,
                status || 'In progress', sheet_ref || null, hero_image_url || null
            ]
        );
        res.json({ success: true, id: result.insertId });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ error: 'A client with that email already exists.' });
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// PUT /api/clients/:id — update client account + project (admin only)
router.put('/:id', requireAdmin, async(req, res) => {
    const {
<<<<<<< HEAD
        name, email, password, company, phone,
        project_name, phase, completion_percent,
        next_milestone_label, next_milestone_date, status, sheet_ref, hero_image_url
=======
        name,
        email,
        password,
        company,
        phone,
        project_name,
        phase,
        completion_percent,
        next_milestone_label,
        next_milestone_date,
        status,
        sheet_ref,
        hero_image_url
>>>>>>> 65689711e64d3c199835421fb6806fb0f1d51d26
    } = req.body;

    try {
        const encryptedPhone = phone ? encrypt(phone) : null;
        if (password) {
            const hashed = await bcrypt.hash(password, 10);
            await db.query(
                'UPDATE clients SET name=?, email=?, company=?, phone=?, password=? WHERE id=?', [name, email, company || null, encryptedPhone, hashed, req.params.id]
            );
        } else {
            await db.query(
                'UPDATE clients SET name=?, email=?, company=?, phone=? WHERE id=?', [name, email, company || null, encryptedPhone, req.params.id]
            );
        }

        const [existing] = await db.query('SELECT id FROM client_projects WHERE client_id=?', [req.params.id]);
        if (existing.length) {
            await db.query(
                `UPDATE client_projects SET
          project_name=?, phase=?, completion_percent=?, next_milestone_label=?,
          next_milestone_date=?, status=?, sheet_ref=?, hero_image_url=?
         WHERE client_id=?`, [
                    project_name || 'Untitled project', phase || null, completion_percent || 0,
                    next_milestone_label || null, next_milestone_date || null, status || 'In progress',
                    sheet_ref || null, hero_image_url || null, req.params.id
                ]
            );
        } else {
            await db.query(
                `INSERT INTO client_projects
          (client_id, project_name, phase, completion_percent, next_milestone_label, next_milestone_date, status, sheet_ref, hero_image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
                    req.params.id, project_name || 'Untitled project', phase || null,
                    completion_percent || 0, next_milestone_label || null, next_milestone_date || null,
                    status || 'In progress', sheet_ref || null, hero_image_url || null
                ]
            );
        }
        res.json({ success: true });
    } catch (err) {
        if (err.code === 'ER_DUP_ENTRY')
            return res.status(409).json({ error: 'A client with that email already exists.' });
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// DELETE /api/clients/:id (admin only)
router.delete('/:id', requireAdmin, async(req, res) => {
    try {
        await db.query('DELETE FROM clients WHERE id = ?', [req.params.id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error.' });
    }
});

<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;
>>>>>>> 65689711e64d3c199835421fb6806fb0f1d51d26
