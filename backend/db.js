// db.js — lidhja me PostgreSQL
// Kredencialet lexohen nga .env (require në server.js e ngarkoi dotenv)
const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 5432,
  database: process.env.DB_NAME     || 'expense_manager',
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Lidhja me DB deshtoi:', err.message);
  } else {
    console.log('✅ U lidh me PostgreSQL:', res.rows[0].now);
  }
});

module.exports = pool;