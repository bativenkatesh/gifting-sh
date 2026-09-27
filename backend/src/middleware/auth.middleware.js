const jwt = require('jsonwebtoken');
const env = require('../config/env');

function authenticate(req, res, next) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, error: { message: 'Authentication token is required.' } });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role || 'user',
    };
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, error: { message: 'Your session has expired or is invalid.' } });
  }
}

function optionalAuthenticate(req, _res, next) {
  const authorization = req.headers.authorization || '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : null;

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role || 'user',
    };
    return next();
  } catch (_error) {
    req.user = null;
    return next();
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, error: { message: 'Admin access is required.' } });
  }
  return next();
}

module.exports = { authenticate, optionalAuthenticate, requireAdmin };
