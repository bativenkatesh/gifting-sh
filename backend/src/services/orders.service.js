const { databaseEnabled, getRecord, listRecords, saveRecord } = require('./commerce-record.service');
const {
  createOrderRecord: createMemoryOrder,
  listOrders: listMemoryOrders,
  findOrderById: findMemoryOrder,
  updateOrderStatus: updateMemoryOrder,
} = require('../data/inMemoryStore');

async function createOrderRecord(order) {
  if (databaseEnabled) return saveRecord('order', order.id, order);
  return createMemoryOrder(order);
}

async function listOrders({ userId, role }) {
  if (!databaseEnabled) return listMemoryOrders({ userId, role });
  const orders = await listRecords('order');
  return orders
    .filter((order) => role === 'admin' || (userId && order.userId === userId))
    .sort((left, right) => new Date(right.createdAt) - new Date(left.createdAt));
}

async function findOrderById(orderId) {
  return databaseEnabled ? getRecord('order', orderId) : findMemoryOrder(orderId);
}

async function updateOrderStatus({ orderId, status, actor, trackingNumber, carrier }) {
  const existingOrder = databaseEnabled ? await getRecord('order', orderId) : findMemoryOrder(orderId);
  if (!existingOrder) return null;
  if (actor && actor.role !== 'admin') {
    const error = new Error('Only admins can update order status.');
    error.statusCode = 403;
    throw error;
  }
  const allowedStatuses = ['pending_payment', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!allowedStatuses.includes(status)) {
    const error = new Error(`Status must be one of: ${allowedStatuses.join(', ')}.`);
    error.statusCode = 400;
    throw error;
  }
  if (status === 'shipped' && !String(trackingNumber || existingOrder.trackingNumber || '').trim()) {
    const error = new Error('A tracking number is required before marking an order shipped.');
    error.statusCode = 400;
    throw error;
  }
  if (!databaseEnabled) {
    return updateMemoryOrder({ orderId, status, actor, trackingNumber, carrier });
  }

  const order = existingOrder;
  order.status = status;
  if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
  if (carrier !== undefined) order.carrier = carrier;
  order.lastUpdated = new Date().toISOString();
  return saveRecord('order', orderId, order);
}

module.exports = { createOrderRecord, listOrders, findOrderById, updateOrderStatus };
