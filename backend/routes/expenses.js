const express = require('express');
const router  = express.Router();
const pool    = require('../db');

// ─── GET /api/expenses ─────────────────────────────────
// Kthen të gjitha shpenzimet me emrin e kategorisë
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM v_expenses_full' // view që krijuam në schema.sql
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

// ─── POST /api/expenses ────────────────────────────────
// Shton shpenzim të ri
// Body: { amount, description, category_id, expense_date }
router.post('/', async (req, res) => {
  try {
    const { amount, description, category_id, expense_date } = req.body;

    // validim bazë
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Shuma duhet të jetë më e madhe se 0' });
    }

    const result = await pool.query(
      `INSERT INTO expenses (amount, description, category_id, expense_date)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [amount, description || null, category_id || null, expense_date || new Date()]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

// ─── DELETE /api/expenses/:id ──────────────────────────
// Fshin shpenzim sipas ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params; // merr id nga URL: /api/expenses/5

    const result = await pool.query(
      'DELETE FROM expenses WHERE id = $1 RETURNING *',
      [id]
    );

    // nëse result.rows është bosh, ID nuk ekzistonte
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Shpenzimi nuk u gjet' });
    }

    res.json({ message: 'Shpenzimi u fshi', deleted: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Gabim në server' });
  }
});

module.exports = router;