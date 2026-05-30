const mongoose = require('mongoose');
require('dotenv').config();

let connected = false;
const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL;

if (mongoUri) {
  mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      connected = true;
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      connected = false;
      console.error('MongoDB connection error, falling back to local storage:', err.message);
    });
}

module.exports = { mongoose, connected };
