const app = require('./src/app');
const request = require('supertest');

async function checkRoutes() {
    console.log('--- ROUTE VERIFICATION ---');

    // Check Health
    const healthRes = await request(app).get('/health');
    console.log('GET /health:', healthRes.status);

    // Check API Index
    const apiIndexRes = await request(app).get('/api/v1');
    console.log('GET /api/v1:', apiIndexRes.status);

    // Check Test Start (should be 401 if unauthorized, NOT 404)
    const testStartRes = await request(app).post('/api/v1/test/start');
    console.log('POST /api/v1/test/start:', testStartRes.status);
    if (testStartRes.status === 404) {
        console.log('MESSAGE:', testStartRes.body.message);
    }

    // Check Analytics (should be 401)
    const analyticsRes = await request(app).get('/api/v1/analytics/performance');
    console.log('GET /api/v1/analytics/performance:', analyticsRes.status);

    console.log('--- END VERIFICATION ---');
    process.exit(0);
}

checkRoutes();
