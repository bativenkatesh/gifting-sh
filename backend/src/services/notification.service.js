const env = require('../config/env');
const { listRecords, saveRecord } = require('./commerce-record.service');

async function notifyOrderCustomer(order, event) {
  const notification = {
    id: `notification-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    userId: order.userId,
    orderId: order.id,
    orderNumber: order.orderNumber,
    event,
    status: order.status,
    trackingNumber: order.trackingNumber || null,
    carrier: order.carrier || null,
    createdAt: new Date().toISOString(),
    read: false,
  };
  await saveRecord('notification', notification.id, notification);

  if (env.emailWebhookUrl && order.email) {
    try {
      const response = await fetch(env.emailWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(env.emailWebhookToken ? { Authorization: `Bearer ${env.emailWebhookToken}` } : {}),
        },
        body: JSON.stringify({
          to: order.email,
          subject: `Order ${order.orderNumber} update`,
          text: notificationText(notification),
          notification,
        }),
      });
      notification.emailDelivery = response.ok ? 'sent' : 'failed';
    } catch {
      notification.emailDelivery = 'failed';
    }
    await saveRecord('notification', notification.id, notification);
  }
  return notification;
}

async function listCustomerNotifications(userId) {
  return (await listRecords('notification'))
    .filter((notification) => notification.userId === userId)
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

function notificationText(notification) {
  const status = notification.status.replaceAll('_', ' ');
  const tracking = notification.trackingNumber
    ? ` Tracking: ${notification.carrier ? `${notification.carrier} ` : ''}${notification.trackingNumber}.`
    : '';
  return `Order ${notification.orderNumber} is now ${status}.${tracking}`;
}

module.exports = { notifyOrderCustomer, listCustomerNotifications };
