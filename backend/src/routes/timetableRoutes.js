const express = require('express');
const { generateTimetable, getTimetable } = require('../controllers/timetableController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect); // Require authentication for all timetable routes

router.post('/generate', generateTimetable);
router.get('/current', getTimetable);

module.exports = router;
