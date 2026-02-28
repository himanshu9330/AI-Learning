const axios = require('axios');

const API_URL = 'http://localhost:5000/api/v1';
const EMAIL = 'testuser_verify@example.com';
const PASSWORD = 'password123';

async function traceStartTest() {
    console.log('--- TEST START TRACE ---');

    try {
        // 1. Login
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: EMAIL,
            password: PASSWORD
        });
        const token = loginRes.data.data.token;
        console.log('Login successful.');

        const config = { headers: { Authorization: `Bearer ${token}` } };

        // 2. Start Test
        console.log('2. Calling /test/start (Physics)...');
        try {
            const startRes = await axios.post(`${API_URL}/test/start`, { subject: 'Physics' }, config);
            console.log('Status:', startRes.status);
            console.log('Response Message:', startRes.data.message);
            console.log('Session ID:', startRes.data.data.session.test_id);
            console.log('Question:', startRes.data.data.question.question_id);
        } catch (e) {
            console.error('ERROR in /test/start:');
            if (e.response) {
                console.error('Status:', e.response.status);
                console.error('Data:', JSON.stringify(e.response.data, null, 2));
            } else {
                console.error(e.message);
            }
        }

        // 3. Resume Session
        console.log('3. Calling /test/resume...');
        try {
            const resumeRes = await axios.get(`${API_URL}/test/resume`, config);
            console.log('Status:', resumeRes.status);
            console.log('Session Found:', !!resumeRes.data.data.session);
        } catch (e) {
            console.error('ERROR in /test/resume:');
            if (e.response) {
                console.error('Status:', e.response.status);
                console.error('Data:', JSON.stringify(e.response.data, null, 2));
            } else {
                console.error(e.message);
            }
        }

    } catch (error) {
        console.error('TRACE FAILED:', error.message);
    }

    console.log('--- TRACE COMPLETE ---');
    process.exit(0);
}

traceStartTest();
