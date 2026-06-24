const { Pool } = require('pg');

const pool = new Pool({
  host:     'localhost',
  port:     5432,
  database: 'expense_manager',
  user:     'drinselmonaj',
  password: ''
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Lidhja me DB deshtoi:', err.message);
  } else {
    console.log('✅ U lidh me PostgreSQL:', res.rows[0].now);
  }
});

module.exports = pool;