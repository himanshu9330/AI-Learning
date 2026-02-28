const express = require('express');
const router = express.Router();

const analyticsController = require('../controllers/analyticsController');
const { protect } = require('../middlewares/auth');

// All analytics routes are protected
router.get('/ability-history', protect, analyticsController.getAbilityHistory);
router.get('/topic-growth', protect, analyticsController.getTopicGrowth);
router.get('/performance', protect, analyticsController.getPerformanceStats);
router.get('/improvement', protect, analyticsController.getImprovementMetrics);
router.get('/topic-mastery', protect, analyticsController.getTopicMastery);
router.get('/weak-topics', protect, analyticsController.getWeakTopics);
router.get('/consistency', protect, analyticsController.getConsistencyStats);

module.exports = router;
