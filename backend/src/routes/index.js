const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const testRoutes = require('./testRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const roadmapRoutes = require('./roadmapRoutes');
const aiRoutes = require('./aiRoutes');
const scheduleRoutes = require('./scheduleRoutes');
const timetableRoutes = require('./timetableRoutes');
const videoRoutes = require('./videoRoutes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/ai', aiRoutes);
router.use('/test', testRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/roadmap', roadmapRoutes);
router.use('/schedule', scheduleRoutes);
router.use('/timetable', timetableRoutes);
router.use('/video', videoRoutes);

// API info route
router.get('/', (req, res) => {
    res.status(200).json({
        status: 'success',
        message: 'AI-Powered Adaptive Learning Platform API',
        version: process.env.API_VERSION || 'v1',
        endpoints: {
            auth: {
                register: 'POST /auth/register',
                login: 'POST /auth/login',
                profile: 'GET /auth/profile (Protected)',
                updateProfile: 'PUT /auth/profile (Protected)'
            },
            test: {
                start: 'POST /test/start (Protected)',
                answer: 'POST /test/answer (Protected)',
                result: 'GET /test/result/:testId (Protected)',
                history: 'GET /test/history (Protected)'
            },
            analytics: {
                abilityHistory: 'GET /analytics/ability-history (Protected)',
                topicGrowth: 'GET /analytics/topic-growth (Protected)',
                performance: 'GET /analytics/performance (Protected)',
                improvement: 'GET /analytics/improvement (Protected)'
            },
            roadmap: {
                generate: 'GET /roadmap/generate?testSessionId=... (Protected)',
                latest: 'GET /roadmap/latest (Protected)'
            },
            ai: {
                explain: 'POST /ai/explain (Protected)',
                practice: 'POST /ai/practice (Protected)',
                health: 'GET /ai/health (Protected)'
            }
        }
    });
});

module.exports = router;
