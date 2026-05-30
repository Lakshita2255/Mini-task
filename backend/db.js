const { Pool } = require('pg');
require('dotenv').config();

let pool = null;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  pool.connect().catch((error) => {
    console.error('Database connection failed, falling back to local storage:', error.message);
    pool = null;
  });
}

module.exports = pool;
