// backend/src/config/db.js
const mongoose = require('mongoose');
const { mongoUri } = require('./env');

async function connectDB() {
  try {
    await mongoose.connect(mongoUri, {
      dbName: 'telegram_cloud_storage'
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
