const env = require('../config/env');

function getHealth(_req, res) {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      service: 'gifting-sh-api',
      environment: env.nodeEnv,
      timestamp: new Date().toISOString(),
    },
  });
}

module.exports = { getHealth };
