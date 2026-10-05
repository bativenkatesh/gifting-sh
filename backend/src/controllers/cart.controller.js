const { getCustomerCart, addProductToCart, updateProductQuantity, removeProductFromCart, clearCustomerCart, mergeCartForUser } = require('../services/cart.service');

async function readCurrentCart(req, res) {
  const cart = await getCustomerCart({ sessionId: req.query.sessionId || req.headers['x-session-id'], userId: req.user?.id || null });
  return res.status(200).json({ success: true, data: { cart } });
}

async function addItem(req, res, next) {
  try {
    const { productId, quantity = 1, customizations = {}, customBox } = req.body || {};
    const sessionId = req.body?.sessionId || req.headers['x-session-id'] || 'guest';
    const cart = await addProductToCart({
      sessionId,
      userId: req.user?.id || null,
      productId,
      quantity: Number(quantity),
      customizations,
      customBox,
    });

    return res.status(200).json({ success: true, data: { cart } });
  } catch (error) {
    return next(error);
  }
}

async function updateItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const { delta = 0 } = req.body || {};
    const sessionId = req.body?.sessionId || req.headers['x-session-id'] || 'guest';
    const cart = await updateProductQuantity({ sessionId, userId: req.user?.id || null, itemId, delta: Number(delta) });
    return res.status(200).json({ success: true, data: { cart } });
  } catch (error) {
    return next(error);
  }
}

async function deleteItem(req, res, next) {
  try {
    const { itemId } = req.params;
    const sessionId = req.body?.sessionId || req.headers['x-session-id'] || 'guest';
    const cart = await removeProductFromCart({ sessionId, userId: req.user?.id || null, itemId });
    return res.status(200).json({ success: true, data: { cart } });
  } catch (error) {
    return next(error);
  }
}

async function clearCart(req, res, next) {
  try {
    const sessionId = req.body?.sessionId || req.headers['x-session-id'] || 'guest';
    const cart = await clearCustomerCart({ sessionId, userId: req.user?.id || null });
    return res.status(200).json({ success: true, data: { cart } });
  } catch (error) {
    return next(error);
  }
}

async function mergeGuestCart(req, res, next) {
  try {
    const sessionId = req.body?.sessionId || req.headers['x-session-id'];
    const cart = await mergeCartForUser(sessionId, req.user.id);
    return res.status(200).json({ success: true, data: { cart } });
  } catch (error) {
    return next(error);
  }
}

module.exports = { readCurrentCart, addItem, updateItem, deleteItem, clearCart, mergeGuestCart };
