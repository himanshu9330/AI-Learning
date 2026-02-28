const express = require('express');
const router = express.Router();
const videoController = require('../controllers/videoController');

// For now, let's keep it public so anyone can summarize from landing page as requested
router.post('/summarize', videoController.summarizeVideo);

module.exports = router;
