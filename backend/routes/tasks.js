const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, title, description, status, priority, due_date, created_at, updated_at
       FROM tasks
       WHERE user_id = $1
       ORDER BY due_date NULLS LAST, created_at DESC`,
      [req.user.id]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return res.status(500).json({ error: 'Failed to load tasks' });
  }
});

router.post('/', auth, async (req, res) => {
  const { title, description, status, priority, due_date } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    const result = await pool.query(
      `INSERT INTO tasks (user_id, title, description, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, title, description, status, priority, due_date, created_at, updated_at`,
      [req.user.id, title, description || '', status || 'todo', priority || 'medium', due_date || null]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { title, description, status, priority, due_date } = req.body;
  try {
    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE(NULLIF($1, ''), title),
           description = COALESCE($2, description),
           status = COALESCE(NULLIF($3, ''), status),
           priority = COALESCE(NULLIF($4, ''), priority),
           due_date = $5,
           updated_at = NOW()
       WHERE id = $6 AND user_id = $7
       RETURNING id, user_id, title, description, status, priority, due_date, created_at, updated_at`,
      [title, description, status, priority, due_date || null, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('PUT /api/tasks/:id error:', error);
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    return res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('DELETE /api/tasks/:id error:', error);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
