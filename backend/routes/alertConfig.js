const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// ─── GET /api/alert-config ─────────────────────────────
// Merr konfigurimin aktual
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM alert_config WHERE id = 1'
    );

    // nëse nuk ekziston ende, kthe vlerat default
    if (result.rows.length === 0) {
      return res.json({
        email:         process.env.ALERT_EMAIL,
        monthly_limit: parseFloat(process.env.ALERT_LIMIT) || 500
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

// ─── POST /api/alert-config ────────────────────────────
// Ruaj ose përditëso konfigurimin
router.post('/', async (req, res) => {
  try {
    const { email, monthly_limit } = req.body;

    if (!email || !monthly_limit) {
      return res.status(400).json({ error: 'Email dhe limiti janë të detyrueshëm' });
    }

    // INSERT ose UPDATE — nëse ekziston përditëso, nëse jo krijo
    const result = await pool.query(`
      INSERT INTO alert_config (id, email, monthly_limit)
      VALUES (1, $1, $2)
      ON CONFLICT (id) DO UPDATE
        SET email = $1, monthly_limit = $2
      RETURNING *
    `, [email, monthly_limit]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

module.exports = router;