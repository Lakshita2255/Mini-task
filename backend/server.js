const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { initSchema } = require('./db');
const taskRoutes = require('./routes/tasks');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => res.send('Task Dashboard API is running'));

const PORT = process.env.PORT || 5000;

initSchema()
  .then(() => {
    const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the existing server or set PORT to a different value.`);
        process.exit(1);
      }
      console.error('Server error:', err);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('Failed to start server because schema initialization failed.');
    process.exit(1);
  });
