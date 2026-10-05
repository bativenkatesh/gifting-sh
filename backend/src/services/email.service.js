const env = require('../config/env');

async function sendEmail({ to, subject, text }) {
  if (!env.emailWebhookUrl) return false;
  const response = await fetch(env.emailWebhookUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(env.emailWebhookToken ? { Authorization: `Bearer ${env.emailWebhookToken}` } : {}),
    },
    body: JSON.stringify({ to, subject, text }),
  });
  if (!response.ok) throw new Error('Email delivery service rejected the message.');
  return true;
}

module.exports = { sendEmail };
