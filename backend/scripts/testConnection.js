require('dotenv').config();
const pool = require('../lib/db');

async function testConnection() {
  try {
    const result = await pool.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1', ['public']);
    console.log('📊 Tables in database:', result.rows.map(row => row.table_name));
    
    const userCheck = await pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'");
    console.log('👥 Users table columns:', userCheck.rows.map(row => row.column_name));
  } catch (error) {
    console.error('Connection error:', error);
  } finally {
    await pool.end();
  }
}

testConnection();