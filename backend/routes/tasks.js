const express = require('express');
const router = express.Router();
const pool = require('../db');

const fallbackTasks = [];
const useDatabase = !!pool;

const createMemoryId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

router.get('/', async (req, res) => {
  try {
    if (useDatabase) {
      try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY due_date NULLS LAST, created_at DESC');
        return res.json(result.rows);
      } catch (error) {
        console.error('Database GET /api/tasks failed, using fallback storage:', error.message);
      }
    }

    return res.json(fallbackTasks);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return res.json(fallbackTasks);
  }
});

router.post('/', async (req, res) => {
  const { title, description, status, priority, due_date } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  if (!due_date) return res.status(400).json({ error: 'Due date is required' });

  try {
    if (useDatabase) {
      try {
        const result = await pool.query(
          `INSERT INTO tasks (title, description, status, priority, due_date)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [title, description || '', status || 'todo', priority || 'medium', due_date]
        );
        return res.status(201).json(result.rows[0]);
      } catch (error) {
        console.error('Database POST /api/tasks failed, using fallback storage:', error.message);
      }
    }

    const newTask = {
      id: createMemoryId(),
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      due_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    fallbackTasks.unshift(newTask);
    return res.status(201).json(newTask);
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/:id', async (req, res) => {
  const { title, description, status, priority, due_date } = req.body;
  try {
    if (useDatabase) {
      try {
        const result = await pool.query(
          `UPDATE tasks
           SET title = $1,
               description = $2,
               status = $3,
               priority = $4,
               due_date = $5,
               updated_at = NOW()
           WHERE id = $6
           RETURNING *`,
          [title, description || '', status || 'todo', priority || 'medium', due_date || null, req.params.id]
        );

        if (!result.rows.length) {
          return res.status(404).json({ error: 'Task not found' });
        }
        return res.json(result.rows[0]);
      } catch (error) {
        console.error('Database PUT /api/tasks failed, using fallback storage:', error.message);
      }
    }

    const index = fallbackTasks.findIndex((task) => task.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }

    fallbackTasks[index] = {
      ...fallbackTasks[index],
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      due_date: due_date || null,
      updated_at: new Date().toISOString(),
    };

    return res.json(fallbackTasks[index]);
  } catch (error) {
    console.error('PUT /api/tasks/:id error:', error);
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (useDatabase) {
      try {
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [req.params.id]);
        if (!result.rows.length) {
          return res.status(404).json({ error: 'Task not found' });
        }
        return res.json({ message: 'Task deleted' });
      } catch (error) {
        console.error('Database DELETE /api/tasks failed, using fallback storage:', error.message);
      }
    }

    const index = fallbackTasks.findIndex((task) => task.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Task not found' });
    }
    fallbackTasks.splice(index, 1);
    return res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('DELETE /api/tasks/:id error:', error);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
