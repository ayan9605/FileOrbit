// backend/models/File.js
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    mimeType: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    telegramFileId: {
      type: String,
      required: true
    },
    telegramMessageId: {
      type: Number,
      required: true
    },
    telegramChatId: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('File', fileSchema);
