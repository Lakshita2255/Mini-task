const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./db');
const taskRoutes = require('./routes/tasks');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => res.send('Task Dashboard API is running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
