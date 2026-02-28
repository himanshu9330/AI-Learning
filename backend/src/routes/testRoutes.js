const express = require('express');
const router = express.Router();

const testController = require('../controllers/testController');
const { protect } = require('../middlewares/auth');

// All test routes are protected
router.post('/start', protect, testController.startTest);
router.get('/next/:testId?', protect, testController.getNextQuestion);
router.post('/answer', protect, testController.submitAnswer);
router.post('/reset', protect, testController.resetSession);
router.get('/resume', protect, testController.resumeSession);
router.get('/session/:testId', protect, testController.getSession);
router.get('/history', protect, testController.getHistory);
router.get('/metadata', protect, testController.getMetadata);

module.exports = router;
