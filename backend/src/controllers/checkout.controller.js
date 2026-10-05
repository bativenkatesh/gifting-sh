const { createOrderFromCart } = require('../services/checkout.service');
const { orders, createOrderRecord, listOrders, updateOrderStatus, findOrderById } = require('../data/inMemoryStore');

async function createCheckoutOrder(req, res, next) {
  try {
    const body = req.body || {};
    const sessionId = body.sessionId || req.headers['x-session-id'] || 'guest';
    const order = await createOrderFromCart({
      user: req.user || null,
      email: body.email,
      shippingAddress: body.shippingAddress,
      billingAddress: body.billingAddress,
      giftMessage: body.giftMessage,
      sessionId,
      userId: req.user?.id || null,
      paymentMethod: body.paymentMethod || 'manual',
    });

    const savedOrder = createOrderRecord(order);
    return res.status(200).json({ success: true, data: { order: savedOrder } });
  } catch (error) {
    return next(error);
  }
}

function getOrders(req, res) {
  const orderList = listOrders({ userId: req.user?.role === 'admin' ? null : req.user?.id || null, role: req.user?.role || 'user' });
  return res.status(200).json({ success: true, data: { orders: orderList } });
}

function updateOrder(req, res, next) {
  try {
    const { orderId } = req.params;
    const { status } = req.body || {};
    const order = updateOrderStatus({ orderId, status, actor: req.user });
    if (!order) {
      return res.status(404).json({ success: false, error: { message: 'Order not found.' } });
    }
    return res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    return next(error);
  }
}

function getOrderById(req, res) {
  const order = findOrderById(req.params.orderId);
  if (!order) {
    return res.status(404).json({ success: false, error: { message: 'Order not found.' } });
  }
  return res.status(200).json({ success: true, data: { order } });
}

module.exports = { createCheckoutOrder, getOrders, updateOrder, getOrderById };
