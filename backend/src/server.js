const app = require('./app');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 5005;

// Start Server
const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    logger.info(`📡 API available at http://localhost:${PORT}/api/${process.env.API_VERSION || 'v1'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error(`Unhandled Rejection: ${err.message}`);
    logger.error(err.stack);

    // Close server & exit process
    server.close(() => {
        process.exit(1);
    });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}`);
    logger.error(err.stack);

    // Exit process
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
    });
});

module.exports = server;
