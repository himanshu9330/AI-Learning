const express = require('express');
const router = express.Router();
const roadmapController = require('../controllers/roadmapController');
const { protect } = require('../middlewares/auth');

// All roadmap routes are protected to ensure user data privacy
router.get('/generate', protect, roadmapController.generateRoadmap);
router.get('/latest', protect, roadmapController.getLatestRoadmap);
router.get('/chapters', protect, roadmapController.getChapterProgress);
router.get('/revisions', protect, roadmapController.getRevisions);
router.patch('/tasks/:taskId', protect, roadmapController.patchTaskStatus);

module.exports = router;
