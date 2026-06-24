const express = require('express');
const router  = express.Router();
const pool    = require('../db'); // importon lidhjen me DB

// ─── GET /api/categories ───────────────────────────────
// Kthen të gjitha kategoritë
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories ORDER BY name'
    );
    res.json(result.rows); // result.rows = array me objekte
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

// ─── POST /api/categories ──────────────────────────────
// Krijon kategori të re
// Body: { name, color, icon }
router.post('/', async (req, res) => {
  try {
    const { name, color, icon } = req.body; // merr të dhënat nga kërkesa

    // validim bazë — name është i detyrueshëm
    if (!name) {
      return res.status(400).json({ error: 'Emri është i detyrueshëm' });
    }

    const result = await pool.query(
      `INSERT INTO categories (name, color, icon)
       VALUES ($1, $2, $3)
       RETURNING *`,           // RETURNING * kthen rreshtin e ri
      [name, color || '#6c757d', icon || 'tag']
    );

    res.status(201).json(result.rows[0]); // 201 = Created
  } catch (err) {
    // kod 23505 = unique violation (emri ekziston)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Kjo kategori ekziston tashmë' });
    }
    console.error(err.message);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

module.exports = router;