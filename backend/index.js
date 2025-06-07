// index.js or wherever needed
const pool = require('./lib/db');

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connected to DB:', res.rows[0]);
  } catch (err) {
    console.error('Database connection error:', err);
  }
})();
