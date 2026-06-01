const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { pool } = require('../db');

const localTasksPath = path.join(__dirname, '..', 'local-tasks.json');
const defaultTasks = [
  {
    id: 1,
    title: 'Plan the product launch',
    description: 'Write the launch checklist, confirm the release date, and schedule the team demo.',
    status: 'todo',
    priority: 'high',
    due_date: '2026-06-10',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Design homepage wireframes',
    description: 'Finalize the homepage layout and gather feedback from the design team.',
    status: 'in_progress',
    priority: 'medium',
    due_date: '2026-06-05',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Review completed sprint tasks',
    description: 'Check off finished work and prepare the retrospective notes.',
    status: 'completed',
    priority: 'low',
    due_date: '2026-05-30',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

function readLocalTasks() {
  if (!fs.existsSync(localTasksPath)) {
    return defaultTasks;
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(localTasksPath, 'utf8'));
    return Array.isArray(parsed) ? parsed : defaultTasks;
  } catch (error) {
    console.error('Failed to read local task storage:', error);
    return defaultTasks;
  }
}

function writeLocalTasks(tasks) {
  fs.writeFileSync(localTasksPath, JSON.stringify(tasks, null, 2));
}

function getNextLocalId(tasks) {
  return tasks.reduce((maxId, task) => Math.max(maxId, Number(task.id) || 0), 0) + 1;
}

function sortTasks(tasks) {
  return [...tasks].sort((a, b) => {
    if (!a.due_date && b.due_date) return 1;
    if (a.due_date && !b.due_date) return -1;
    if (a.due_date && b.due_date && a.due_date !== b.due_date) {
      return new Date(a.due_date) - new Date(b.due_date);
    }
    return new Date(b.created_at) - new Date(a.created_at);
  });
}

router.get('/', async (req, res) => {
  if (!pool) {
    return res.json(sortTasks(readLocalTasks()));
  }

  try {
    const result = await pool.query(
      `SELECT id, title, description, status, priority, due_date, created_at, updated_at
       FROM tasks
       ORDER BY due_date NULLS LAST, created_at DESC`
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return res.status(500).json({ error: 'Failed to load tasks' });
  }
});

router.post('/', async (req, res) => {
  const { title, description, status, priority, due_date } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  if (!pool) {
    const tasks = readLocalTasks();
    const now = new Date().toISOString();
    const task = {
      id: getNextLocalId(tasks),
      title,
      description: description || '',
      status: status || 'todo',
      priority: priority || 'medium',
      due_date: due_date || null,
      created_at: now,
      updated_at: now,
    };
    tasks.push(task);
    writeLocalTasks(tasks);
    return res.status(201).json(task);
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, priority, due_date)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, title, description, status, priority, due_date, created_at, updated_at`,
      [title, description || '', status || 'todo', priority || 'medium', due_date || null]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('POST /api/tasks error:', error);
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

router.put('/:id', async (req, res) => {
  const { title, description, status, priority, due_date } = req.body;

  if (!pool) {
    const tasks = readLocalTasks();
    const task = tasks.find((item) => item.id === Number(req.params.id));
    if (!task) return res.status(404).json({ error: 'Task not found' });

    task.title = title || task.title;
    task.description = description ?? task.description;
    task.status = status || task.status;
    task.priority = priority || task.priority;
    task.due_date = due_date || null;
    task.updated_at = new Date().toISOString();
    writeLocalTasks(tasks);
    return res.json(task);
  }

  try {
    const result = await pool.query(
      `UPDATE tasks
       SET title = COALESCE(NULLIF($1, ''), title),
           description = COALESCE($2, description),
           status = COALESCE(NULLIF($3, ''), status),
           priority = COALESCE(NULLIF($4, ''), priority),
           due_date = $5,
           updated_at = NOW()
       WHERE id = $6
       RETURNING id, title, description, status, priority, due_date, created_at, updated_at`,
      [title, description, status, priority, due_date || null, req.params.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('PUT /api/tasks/:id error:', error);
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/:id', async (req, res) => {
  if (!pool) {
    const tasks = readLocalTasks();
    const taskIndex = tasks.findIndex((item) => item.id === Number(req.params.id));
    if (taskIndex === -1) return res.status(404).json({ error: 'Task not found' });

    tasks.splice(taskIndex, 1);
    writeLocalTasks(tasks);
    return res.json({ message: 'Task deleted' });
  }

  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1 RETURNING id',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    return res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('DELETE /api/tasks/:id error:', error);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
