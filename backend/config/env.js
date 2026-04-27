// backend/src/config/env.js
require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: '7d',
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN,
  telegramChannelId: process.env.TELEGRAM_CHANNEL_ID // e.g. -1001234567890
};
