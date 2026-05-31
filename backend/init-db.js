const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const sqlPath = path.join(__dirname, 'db-schema.sql');
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

if (!connectionString) {
  console.log('No DATABASE_URL or POSTGRES_URL found. Skipping PostgreSQL schema initialization.');
  process.exit(0);
}

const placeholderPattern = /^postgresql:\/\/USER:PASSWORD@HOST(:\d+)?\/.+$/i;
if (placeholderPattern.test(connectionString)) {
  console.log('DATABASE_URL contains sample placeholder values. Skipping PostgreSQL schema initialization.');
  process.exit(0);
}

const pool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

(async () => {
  try {
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await pool.query(sql);
    console.log('Database schema initialized successfully.');

    const countResult = await pool.query('SELECT COUNT(*) FROM tasks');
    const taskCount = Number(countResult.rows[0].count || 0);

    if (taskCount === 0) {
      const sampleTasks = [
        {
          title: 'Plan the product launch',
          description: 'Write the launch checklist, confirm the release date, and schedule the team demo.',
          status: 'todo',
          priority: 'high',
          due_date: '2026-06-10',
        },
        {
          title: 'Design homepage wireframes',
          description: 'Finalize the homepage layout and gather feedback from the design team.',
          status: 'in_progress',
          priority: 'medium',
          due_date: '2026-06-05',
        },
        {
          title: 'Review completed sprint tasks',
          description: 'Check off finished work and prepare the retrospective notes.',
          status: 'completed',
          priority: 'low',
          due_date: '2026-05-30',
        },
      ];

      const insertPromises = sampleTasks.map((task) =>
        pool.query(
          `INSERT INTO tasks (title, description, status, priority, due_date)
           VALUES ($1, $2, $3, $4, $5)`,
          [task.title, task.description, task.status, task.priority, task.due_date]
        )
      );

      await Promise.all(insertPromises);
      console.log('Inserted sample task seed data.');
    }
  } catch (error) {
    console.error('Failed to initialize database schema:', error.message || error);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
