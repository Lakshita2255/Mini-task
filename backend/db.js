const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
const placeholderPattern = /^postgresql:\/\/USER:PASSWORD@HOST(:\d+)?\/.+$/i;
const hasDatabase = Boolean(connectionString) && !placeholderPattern.test(connectionString);

if (!connectionString) {
  console.warn('No DATABASE_URL or POSTGRES_URL found. Using in-memory tasks for local development.');
} else if (!hasDatabase) {
  console.warn('DATABASE_URL still contains sample placeholder values. Using in-memory tasks for local development.');
}

const pool = hasDatabase
  ? new Pool({
      connectionString,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    })
  : null;

if (pool) {
  pool.on('connect', () => {
    console.log('Connected to PostgreSQL');
  });

  pool.on('error', (err) => {
    console.error('PostgreSQL pool error', err);
  });
}

async function initSchema() {
  if (!pool) {
    console.log('Skipped PostgreSQL schema initialization.');
    return;
  }

  const schemaPath = path.join(__dirname, 'db-schema.sql');
  try {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    await pool.query(schemaSql);
    console.log('PostgreSQL schema is initialized.');
  } catch (err) {
    console.error('Failed to initialize PostgreSQL schema:', err.message || err);
    throw err;
  }
}

module.exports = { pool, initSchema, hasDatabase };
