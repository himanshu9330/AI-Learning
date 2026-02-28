try {
    console.log('Requiring app.js...');
    require('./src/app');
    console.log('Successfully required app.js');
} catch (error) {
    console.error('FAILED to require app.js:');
    console.error(error);
}
