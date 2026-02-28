const express = require('express');
const router = express.Router();

const aiController = require('../controllers/aiController');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const {
    explainValidation,
    practiceValidation
} = require('../validators/aiValidator');

// All AI routes are protected
router.post('/explain', protect, explainValidation, validate, aiController.getExplanation);
router.post('/practice', protect, practiceValidation, validate, aiController.generatePractice);
router.get('/health', protect, aiController.checkHealth);

module.exports = router;
