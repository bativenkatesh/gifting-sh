const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const { findUserByEmail, findUserById, createUser, updateUserVerification, updateUserPassword } = require('../data/inMemoryStore');
const User = env.databaseUrl && env.nodeEnv !== 'test' ? require('../models/user.model') : null;
const { createActionToken, consumeActionToken } = require('../services/auth-token.service');
const { sendEmail } = require('../services/email.service');

function createToken(user) {
  return jwt.sign({ sub: user.id, email: user.email, role: user.role || 'user' }, env.jwtSecret, { expiresIn: '7d' });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role || 'user', isVerified: user.isVerified !== false };
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
    if (env.nodeEnv === 'production' && !env.emailWebhookUrl) {
      return res.status(503).json({ success: false, error: { message: 'Email delivery is not configured for account verification.' } });
    }

    const existingUser = User
      ? await User.findOne({ where: { email } })
      : findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ success: false, error: { message: 'An account with that email already exists.' } });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const requiresEmailVerification = Boolean(env.emailWebhookUrl);
    const user = User
      ? await User.create({ name, email, passwordHash, role: 'user', isVerified: !requiresEmailVerification, requiresEmailVerification })
      : createUser({ name, email, passwordHash, role: 'user', isVerified: !requiresEmailVerification, requiresEmailVerification });

    if (requiresEmailVerification) {
      const actionToken = await createActionToken({ userId: user.id, type: 'verify-email' });
      const verifyUrl = `${env.frontendUrl}/verify-email?token=${encodeURIComponent(actionToken)}`;
      await sendEmail({ to: email, subject: 'Verify your Sannidhi Collective account', text: `Verify your account: ${verifyUrl}` });
      return res.status(201).json({ success: true, data: { user: publicUser(user), verificationRequired: true } });
    }

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

    if (!user || user.isActive === false || (user.requiresEmailVerification && !user.isVerified) || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ success: false, error: { message: 'Email or password is incorrect.' } });
    }

    return res.json({ success: true, data: { token: createToken(user), user: publicUser(user) } });
  } catch (error) {
    return next(error);
  }
}

async function verifyEmail(req, res, next) {
  try {
    const userId = await consumeActionToken(req.body?.token, 'verify-email');
    if (!userId) return res.status(400).json({ success: false, error: { message: 'Verification link is invalid or expired.' } });
    const user = User
      ? await User.findByPk(userId)
      : findUserById(userId);
    if (!user) return res.status(404).json({ success: false, error: { message: 'Account not found.' } });
    if (User) {
      user.isVerified = true;
      user.requiresEmailVerification = false;
      await user.save();
    } else updateUserVerification(userId, true);
    return res.json({ success: true, data: { user: publicUser(user), token: createToken(user) } });
  } catch (error) { return next(error); }
}

async function requestPasswordReset(req, res, next) {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const user = User ? await User.findOne({ where: { email } }) : findUserByEmail(email);
    let actionToken;
    if (user) {
      actionToken = await createActionToken({ userId: user.id, type: 'password-reset' });
      if (env.emailWebhookUrl) {
        const resetUrl = `${env.frontendUrl}/reset-password?token=${encodeURIComponent(actionToken)}`;
        await sendEmail({ to: email, subject: 'Reset your Sannidhi Collective password', text: `Reset your password: ${resetUrl}` });
      }
    }
    return res.status(202).json({
      success: true,
      data: {
        message: 'If an account exists for that email, password reset instructions have been sent.',
        ...(env.nodeEnv !== 'production' && actionToken ? { developmentToken: actionToken } : {}),
      },
    });
  } catch (error) { return next(error); }
}

async function resetPassword(req, res, next) {
  try {
    const token = req.body?.token;
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (password.length < 8) return res.status(400).json({ success: false, error: { message: 'Password must contain at least 8 characters.' } });
    const userId = await consumeActionToken(token, 'password-reset');
    if (!userId) return res.status(400).json({ success: false, error: { message: 'Password reset link is invalid or expired.' } });
    const passwordHash = await bcrypt.hash(password, 12);
    if (User) {
      const user = await User.findByPk(userId);
      if (!user) return res.status(404).json({ success: false, error: { message: 'Account not found.' } });
      user.passwordHash = passwordHash;
      await user.save();
    } else if (!updateUserPassword(userId, passwordHash)) {
      return res.status(404).json({ success: false, error: { message: 'Account not found.' } });
    }
    return res.json({ success: true, data: { message: 'Password updated. You can now sign in.' } });
  } catch (error) { return next(error); }
}

module.exports = { login, signup, verifyEmail, requestPasswordReset, resetPassword };