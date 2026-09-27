const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { findUserByEmail, createUser } = require('../data/inMemoryStore');
const User = env.databaseUrl && env.nodeEnv !== 'test' ? require('../models/user.model') : null;

function createToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role || 'user' }, env.jwtSecret, { expiresIn: '7d' });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role || 'user' };
}

async function signup(req, res, next) {
  try {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!name || !email || password.length < 8) {
      return res.status(400).json({
        success: false,
        error: { message: 'Name, email, and a password of at least 8 characters are required.' },
      });
    }

    const existingUser = User
      ? await User.findOne({ where: { email } })
      : findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, error: { message: 'An account with that email already exists.' } });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = User
      ? await User.create({ name, email, passwordHash, role: 'user' })
      : createUser({ name, email, passwordHash, role: 'user' });

    return res.status(201).json({ success: true, data: { token: createToken(user), user: publicUser(user) } });
  } catch (error) {
    return next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const user = User
      ? await User.scope(null).findOne({ where: { email } })
      : findUserByEmail(email);

    if (!user || user.isActive === false || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, error: { message: 'Email or password is incorrect.' } });
    }

    return res.json({ success: true, data: { token: createToken(user), user: publicUser(user) } });
  } catch (error) {
    return next(error);
  }
}

module.exports = { login, signup };