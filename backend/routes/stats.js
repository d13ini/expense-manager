const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// ─── GET /api/stats/daily ──────────────────────────────
// Shpenzimet ditore — 30 ditët e fundit (për bar chart)
router.get('/daily', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM v_daily_totals');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

// ─── GET /api/stats/weekly ─────────────────────────────
// Shpenzimet javore — 12 javët e fundit (për line chart)
router.get('/weekly', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM v_weekly_totals');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

// ─── GET /api/stats/monthly ────────────────────────────
// Shpenzimet mujore (për line chart alternativ)
router.get('/monthly', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM v_monthly_totals');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

// ─── GET /api/stats/by-category ───────────────────────
// Shpenzimet sipas kategorisë (për donut chart)
router.get('/by-category', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM v_totals_by_category');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

module.exports = router;