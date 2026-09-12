const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { initializeDatabase } = require('./database');
require('./models/user.model');

const server = http.createServer(app);

async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database connection established');

    server.listen(env.port, () => {
      console.log(`API listening on port ${env.port} (${env.nodeEnv})`);
    });
  } catch (error) {
    const reason = error.code || error.parent?.code || error.message || error.parent?.message || 'unknown error';
    console.error(`Database connection failed: ${reason}`);
    process.exitCode = 1;
  }
}

startServer();

function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close((error) => {
    if (error) {
      console.error('Error during shutdown', error);
      process.exitCode = 1;
    }
    process.exit();
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

module.exports = server;
