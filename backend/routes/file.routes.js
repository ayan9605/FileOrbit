// backend/routes/file.routes.js
const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const fileController = require('../controllers/file.controller');

const router = express.Router();

// Use memory storage so files are not written to disk
const upload = multer({ storage: multer.memoryStorage() });

// IMPORTANT: every middleware argument here MUST be a function
router.post(
  '/',
  auth,                     // function (req, res, next)
  upload.single('file'),    // function (req, res, next)
  fileController.uploadFile // function (req, res, next)
);

router.get('/', auth, fileController.listFiles);
router.get('/:id/stream', auth, fileController.streamFile);
router.delete('/:id', auth, fileController.deleteFile);

module.exports = router;
