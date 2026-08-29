import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  logger.info(`Server listening on port ${PORT}`);
});

const shutdown = (signal) => {
  logger.info(`${signal} received, shutting down`);
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
