const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { protect } = require('../middlewares/auth');

router.use(protect);

router.post('/generate', scheduleController.generateSchedule);
router.get('/today', scheduleController.getTodaySchedule);
router.patch('/complete-task/:taskId', scheduleController.completeTask);
router.patch('/mark-topic-complete', scheduleController.markTopicComplete);

module.exports = router;
