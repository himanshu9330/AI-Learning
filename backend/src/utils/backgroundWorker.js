const logger = require('./logger');

/**
 * Background Worker Utility
 * Simple wrapper for setImmediate/async tasks that shouldn't block the request-response cycle.
 */
class BackgroundWorker {
    /**
     * Execute a task in the background
     * @param {Function} task - Async function to execute
     * @param {string} taskName - Name of the task for logging
     */
    enqueue(task, taskName = 'anonymous') {
        setImmediate(async () => {
            try {
                // logger.info(`[BackgroundWorker] Starting task: ${taskName}`);
                await task();
                // logger.info(`[BackgroundWorker] Completed task: ${taskName}`);
            } catch (error) {
                console.error(`[BackgroundWorker] Error in task ${taskName}:`, error);
                // logger.error(`[BackgroundWorker] Failed task: ${taskName}`, error);
            }
        });
    }
}

module.exports = new BackgroundWorker();
