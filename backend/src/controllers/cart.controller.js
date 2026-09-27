const { getCustomerCart, addProductToCart, updateProductQuantity, removeProductFromCart, clearCustomerCart, mergeCartForUser } = require('../services/cart.service');

function readCurrentCart(req, res) {
  const cart = getCustomerCart({ sessionId: req.query.sessionId || req.headers['x-session-id'], userId: req.user?.id || null });
  return res.status(200).json({ success: true, data: { cart } });
}

function addItem(req, res, next) {
  try {
    const { productId, quantity = 1, customizations = {} } = req.body || {};
    const sessionId = req.body?.sessionId || req.headers['x-session-id'] || 'guest';
    const cart = addProductToCart({
      sessionId,
      userId: req.user?.id || null,
      productId,
      quantity: Number(quantity),
      customizations,
    });

    return res.status(200).json({ success: true, data: { cart } });
  } catch (error) {
    return next(error);
  }
}

function updateItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const { delta = 0 } = req.body || {};
    const sessionId = req.body?.sessionId || req.headers['x-session-id'] || 'guest';
    const cart = updateProductQuantity({ sessionId, userId: req.user?.id || null, itemId, delta: Number(delta) });
    return res.status(200).json({ success: true, data: { cart } });
  } catch (error) {
    return next(error);
  }
}

function deleteItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const sessionId = req.body?.sessionId || req.headers['x-session-id'] || 'guest';
    const cart = removeProductFromCart({ sessionId, userId: req.user?.id || null, itemId });
    return res.status(200).json({ success: true, data: { cart } });
  } catch (error) {
    return next(error);
  }
}

function clearCart(req, res, next) {
  try {
    const sessionId = req.body?.sessionId || req.headers['x-session-id'] || 'guest';
    const cart = clearCustomerCart({ sessionId, userId: req.user?.id || null });
    return res.status(200).json({ success: true, data: { cart } });
  } catch (error) {
    return next(error);
  }
}

function mergeGuestCart(req, res, next) {
  try {
    const sessionId = req.body?.sessionId || req.headers['x-session-id'];
    const cart = mergeCartForUser(sessionId, req.user.id);
    return res.status(200).json({ success: true, data: { cart } });
  } catch (error) {
    return next(error);
  }
}

module.exports = { readCurrentCart, addItem, updateItem, deleteItem, clearCart, mergeGuestCart };
