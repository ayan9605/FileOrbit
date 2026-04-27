// backend/controllers/file.controller.js
const axios = require('axios');
const File = require('../models/File');
const {
  sendFileToTelegram,
  getTelegramFilePath,
  deleteTelegramMessage,
  buildTelegramFileUrl
} = require('../config/telegram');
const { telegramChannelId } = require('../config/env');

/**
 * POST /api/files
 * Requires auth, multipart/form-data with field "file".
 */
async function uploadFile(req, res, next) {
  try {
    const file = req.file; // multer puts file here
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Send file to Telegram channel
    const tgMeta = await sendFileToTelegram({
      filename: file.originalname,
      mimetype: file.mimetype,
      buffer: file.buffer
    });

    // Save metadata in DB
    const dbFile = await File.create({
      owner: req.user.id,
      originalName: file.originalname,
      mimeType: tgMeta.mimeType || file.mimetype,
      size: tgMeta.fileSize || file.size,
      telegramFileId: tgMeta.fileId,
      telegramMessageId: tgMeta.messageId,
      telegramChatId: telegramChannelId
    });

    res.status(201).json({
      id: dbFile._id,
      originalName: dbFile.originalName,
      mimeType: dbFile.mimeType,
      size: dbFile.size,
      createdAt: dbFile.createdAt
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/files
 * List files for current user.
 */
async function listFiles(req, res, next) {
  try {
    const files = await File.find({ owner: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(
      files.map((f) => ({
        id: f._id,
        originalName: f.originalName,
        mimeType: f.mimeType,
        size: f.size,
        createdAt: f.createdAt
      }))
    );
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/files/:id/stream
 * Streams file content from Telegram via backend.
 */
async function streamFile(req, res, next) {
  try {
    const { id } = req.params;
    const dbFile = await File.findOne({ _id: id, owner: req.user.id });
    if (!dbFile) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Get temporary file_path via getFile.[web:2][web:5][web:11]
    const filePath = await getTelegramFilePath(dbFile.telegramFileId);
    const fileUrl = buildTelegramFileUrl(filePath);

    // Stream from Telegram to client
    const tgResponse = await axios.get(fileUrl, {
      responseType: 'stream'
    });

    res.setHeader('Content-Type', dbFile.mimeType || 'application/octet-stream');

    // Optional: force download instead of inline
    // res.setHeader('Content-Disposition', `attachment; filename="${dbFile.originalName}"`);

    tgResponse.data.pipe(res);
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/files/:id
 * Delete file metadata and Telegram message.
 */
async function deleteFile(req, res, next) {
  try {
    const { id } = req.params;
    const dbFile = await File.findOne({ _id: id, owner: req.user.id });
    if (!dbFile) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Try deleting from Telegram channel
    try {
      await deleteTelegramMessage(dbFile.telegramChatId, dbFile.telegramMessageId);
    } catch (tgErr) {
      console.warn('Failed to delete Telegram message', tgErr.message);
      // Continue to delete from DB even if Telegram message is missing
    }

    await dbFile.deleteOne();

    res.json({ message: 'File deleted' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  uploadFile,
  listFiles,
  streamFile,
  deleteFile
};
