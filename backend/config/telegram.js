// backend/src/config/telegram.js
const axios = require('axios');
const FormData = require('form-data');
const { telegramBotToken, telegramChannelId } = require('./env');

const TELEGRAM_API_BASE = `https://api.telegram.org/bot${telegramBotToken}`;
const TELEGRAM_FILE_BASE = `https://api.telegram.org/file/bot${telegramBotToken}`;

/**
 * Send a file (Buffer/stream) to Telegram channel via sendDocument.
 * Returns { message_id, file_id, mime_type, file_size, file_unique_id }.
 */
async function sendFileToTelegram({ filename, mimetype, buffer }) {
  const form = new FormData();
  form.append('chat_id', telegramChannelId);
  form.append('document', buffer, {
    filename,
    contentType: mimetype
  });

  const url = `${TELEGRAM_API_BASE}/sendDocument`; // Bot API sendDocument.[web:10][web:13]
  const res = await axios.post(url, form, {
    headers: form.getHeaders()
  });

  if (!res.data.ok) {
    throw new Error(`Telegram sendDocument failed: ${JSON.stringify(res.data)}`);
  }

  const message = res.data.result;
  const document = message.document;
  return {
    messageId: message.message_id,
    fileId: document.file_id,
    mimeType: document.mime_type,
    fileSize: document.file_size,
    fileUniqueId: document.file_unique_id
  };
}

/**
 * Call getFile(file_id) and return Telegram file_path.[web:2][web:8][web:11][web:13]
 */
async function getTelegramFilePath(fileId) {
  const url = `${TELEGRAM_API_BASE}/getFile`;
  const res = await axios.get(url, {
    params: { file_id: fileId }
  });

  if (!res.data.ok) {
    throw new Error(`Telegram getFile failed: ${JSON.stringify(res.data)}`);
  }

  return res.data.result.file_path;
}

/**
 * Delete message from channel using deleteMessage.[web:13]
 */
async function deleteTelegramMessage(chatId, messageId) {
  const url = `${TELEGRAM_API_BASE}/deleteMessage`;
  const res = await axios.post(url, null, {
    params: { chat_id: chatId, message_id: messageId }
  });

  // deleteMessage returns ok: true even if message is already gone.
  if (!res.data.ok) {
    throw new Error(`Telegram deleteMessage failed: ${JSON.stringify(res.data)}`);
  }

  return true;
}

/**
 * Build full file URL from file_path.
 */
function buildTelegramFileUrl(filePath) {
  return `${TELEGRAM_FILE_BASE}/${filePath}`; // official pattern.[web:2][web:5][web:11]
}

module.exports = {
  sendFileToTelegram,
  getTelegramFilePath,
  deleteTelegramMessage,
  buildTelegramFileUrl
};
