const express = require('express');
const router = express.Router();
const { strictLimiter } = require('../middleware/rateLimiter');
const {
  getFolders,
  getFolderById,
  createFolder,
  updateFolder,
  deleteFolder
} = require('../controllers/folderController');

router.route('/')
  .get(getFolders)
  .post(strictLimiter, createFolder);

router.route('/:id')
  .get(getFolderById)
  .put(strictLimiter, updateFolder)
  .delete(strictLimiter, deleteFolder);

module.exports = router;
