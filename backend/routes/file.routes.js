// backend/routes/file.routes.js
const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const fileController = require('../controllers/file.controller');

const router = express.Router();

// Use memory storage so files are not written to disk
const upload = multer({ storage: multer.memoryStorage() });

// DEBUG: log what we are passing to router.post
console.log('auth typeof:', typeof auth);
console.log('upload.single typeof:', typeof upload.single('file'));
console.log('fileController typeof:', typeof fileController);
console.log('fileController.uploadFile typeof:', typeof fileController.uploadFile);

// Routes
router.post(
  '/',
  auth,
  upload.single('file'),
  fileController.uploadFile
);

router.get('/', auth, fileController.listFiles);
router.get('/:id/stream', auth, fileController.streamFile);
router.delete('/:id', auth, fileController.deleteFile);

module.exports = router;
