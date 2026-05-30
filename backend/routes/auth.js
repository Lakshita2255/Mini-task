const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const { connected } = require('../db');
const User = require('../models/User');
const fallbackUsers = [];
const createMemoryId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    if (connected) {
      const existing = await User.findOne({ email });
      if (existing) return res.status(409).json({ error: 'User already exists' });

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);
      const user = new User({ email, passwordHash: hash, name });
      await user.save();

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
      return res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
    }

    const existing = fallbackUsers.find((u) => u.email === email);
    if (existing) return res.status(409).json({ error: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const user = { id: createMemoryId(), email, passwordHash: hash, name: name || '' };
    fallbackUsers.push(user);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Register error', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    if (connected) {
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
      return res.json({ token, user: { id: user._id, email: user.email, name: user.name } });
    }

    const user = fallbackUsers.find((u) => u.email === email);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    console.error('Login error', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;
