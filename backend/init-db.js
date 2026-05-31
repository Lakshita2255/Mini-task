const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const sqlPath = path.join(__dirname, 'db-schema.sql');
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Missing DATABASE_URL in environment. Set it in backend/.env before running this script.');
  process.exit(1);
}

const pool = new Pool({ connectionString });

(async () => {
  try {
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log('Database schema initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize database schema:', error.message || error);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
