const { createHash, randomBytes } = require('node:crypto');
const { deleteRecord, getRecord, saveRecord } = require('./commerce-record.service');

function tokenHash(token) {
  return createHash('sha256').update(token).digest('hex');
}

async function createActionToken({ userId, type }) {
  const token = randomBytes(32).toString('hex');
  const hash = tokenHash(token);
  await saveRecord('auth-token', `${type}:${hash}`, {
    userId,
    type,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  });
  return token;
}

async function consumeActionToken(token, type) {
  if (typeof token !== 'string' || !token) return null;
  const hash = tokenHash(token);
  const key = `${type}:${hash}`;
  const record = await getRecord('auth-token', key);
  await deleteRecord('auth-token', key);
  if (!record || record.type !== type || new Date(record.expiresAt) <= new Date()) return null;
  return record.userId;
}

module.exports = { createActionToken, consumeActionToken };
