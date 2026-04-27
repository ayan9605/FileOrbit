// backend/routes/file.routes.js
const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const {
  uploadFile,
  listFiles,
  streamFile,
  deleteFile
} = require('../controllers/file.controller');

const router = express.Router();

// Use memory storage to avoid writing to disk.
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', auth, upload.single('file'), uploadFile);
router.get('/', auth, listFiles);
router.get('/:id/stream', auth, streamFile);
router.delete('/:id', auth, deleteFile);

module.exports = router;
