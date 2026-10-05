const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const errorHandler = require('./middleware/error.middleware');
const notFoundHandler = require('./middleware/not-found.middleware');
const apiRoutes = require('./routes');

const app = express();

app.disable('x-powered-by');
app.use(helmet());
const allowedOrigins = new Set([env.corsOrigin, env.adminCorsOrigin].filter(Boolean));
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    data: { service: 'gifting-sh-api' },
  });
});

app.use('/api/v1', apiRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
