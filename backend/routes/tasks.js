const express = require('express');
const router = express.Router();
const { mongoose, connected } = require('../db');
const Task = require('../models/Task');
const auth = require('../middleware/auth');

const fallbackTasks = [];
const createMemoryId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

router.get('/', auth, async (req, res) => {
  try {
    if (connected) {
      const tasks = await Task.find({ user: req.user.id }).sort({ due_date: 1, created_at: -1 }).lean();
      return res.json(tasks);
    }
    // fallback in-memory filtered by user id
    const userTasks = fallbackTasks.filter((t) => String(t.user) === String(req.user.id));
    return res.json(userTasks);
  } catch (error) {
    console.error('GET /api/tasks error:', error);
    return res.status(500).json({ error: 'Failed to load tasks' });
  }
});

router.post('/', auth, async (req, res) => {
  const { title, description, status, priority, due_date } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });

  try {
    if (connected) {
      const doc = new Task({
        user: req.user.id,
        title,
        description: description || '',
        status: status || 'todo',
        priority: priority || 'medium',
        due_date: due_date || null,
      });
      await doc.save();
      return res.status(201).json(doc);
    }

    const newTask = {
      id: createMemoryId(),
      user: req.user.id,
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

router.put('/:id', auth, async (req, res) => {
  const { title, description, status, priority, due_date } = req.body;
  try {
    if (connected) {
      const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
      if (!task) return res.status(404).json({ error: 'Task not found' });
      task.title = title || task.title;
      task.description = description || task.description;
      task.status = status || task.status;
      task.priority = priority || task.priority;
      task.due_date = due_date || task.due_date;
      await task.save();
      return res.json(task);
    }

    const index = fallbackTasks.findIndex((task) => task.id === req.params.id && String(task.user) === String(req.user.id));
    if (index === -1) return res.status(404).json({ error: 'Task not found' });

    fallbackTasks[index] = {
      ...fallbackTasks[index],
      title: title || fallbackTasks[index].title,
      description: description || fallbackTasks[index].description,
      status: status || fallbackTasks[index].status,
      priority: priority || fallbackTasks[index].priority,
      due_date: due_date || fallbackTasks[index].due_date,
      updated_at: new Date().toISOString(),
    };
    return res.json(fallbackTasks[index]);
  } catch (error) {
    console.error('PUT /api/tasks/:id error:', error);
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    if (connected) {
      const result = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
      if (!result) return res.status(404).json({ error: 'Task not found' });
      return res.json({ message: 'Task deleted' });
    }

    const index = fallbackTasks.findIndex((task) => task.id === req.params.id && String(task.user) === String(req.user.id));
    if (index === -1) return res.status(404).json({ error: 'Task not found' });
    fallbackTasks.splice(index, 1);
    return res.json({ message: 'Task deleted' });
  } catch (error) {
    console.error('DELETE /api/tasks/:id error:', error);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
