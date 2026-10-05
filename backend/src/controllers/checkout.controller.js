const { createOrderFromCart, quoteCart } = require('../services/checkout.service');
const { listOrders, updateOrderStatus, findOrderById } = require('../services/orders.service');
const { notifyOrderCustomer } = require('../services/notification.service');

async function getCheckoutQuote(req, res, next) {
  try {
    const quote = await quoteCart({
      userId: req.user?.id || null,
      sessionId: req.query.sessionId || req.headers['x-session-id'] || 'guest',
      couponCode: req.query.couponCode,
    });
    return res.json({ success: true, data: { quote } });
  } catch (error) { return next(error); }
}

async function createCheckoutOrder(req, res, next) {
  try {
    const body = req.body || {};
    const sessionId = body.sessionId || req.headers['x-session-id'] || 'guest';
    const savedOrder = await createOrderFromCart({
      user: req.user || null,
      email: body.email,
      shippingAddress: body.shippingAddress,
      billingAddress: body.billingAddress,
      giftMessage: body.giftMessage,
      couponCode: body.couponCode,
      sessionId,
      userId: req.user?.id || null,
      paymentMethod: body.paymentMethod || 'manual',
    });

    await notifyOrderCustomer(savedOrder, 'order_placed');
    return res.status(201).json({ success: true, data: { order: savedOrder } });
  } catch (error) {
    return next(error);
  }
}

async function getOrders(req, res) {
  const orderList = await listOrders({ userId: req.user?.role === 'admin' ? null : req.user?.id || null, role: req.user?.role || 'user' });
  return res.status(200).json({ success: true, data: { orders: orderList } });
}

async function updateOrder(req, res, next) {
  try {
    const { orderId } = req.params;
    const { status } = req.body || {};
    const order = await updateOrderStatus({ orderId, status, actor: req.user, trackingNumber: req.body?.trackingNumber, carrier: req.body?.carrier });
    if (!order) {
      return res.status(404).json({ success: false, error: { message: 'Order not found.' } });
    }
    await notifyOrderCustomer(order, 'order_updated');
    return res.status(200).json({ success: true, data: { order } });
  } catch (error) {
    return next(error);
  }
}

async function getOrderById(req, res) {
  const order = await findOrderById(req.params.orderId);
  if (!order || (req.user?.role !== 'admin' && order.userId !== req.user?.id)) {
    return res.status(404).json({ success: false, error: { message: 'Order not found.' } });
  }
  return res.status(200).json({ success: true, data: { order } });
}

module.exports = { createCheckoutOrder, getCheckoutQuote, getOrders, updateOrder, getOrderById };
