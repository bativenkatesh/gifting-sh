const http = require('http');
const app = require('./app');
const env = require('./config/env');

const server = http.createServer(app);

server.listen(env.port, () => {
  console.log(`API listening on port ${env.port} (${env.nodeEnv})`);
});

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
