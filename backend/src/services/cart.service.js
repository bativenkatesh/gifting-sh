const { getCart, addItemToCart, updateCartItemQuantity, removeCartItem, clearCart, mergeGuestCartToUser } = require('../data/inMemoryStore');
const { findProductById, createCustomBoxProduct } = require('./catalog.service');
const { databaseEnabled, getRecord, saveRecord, deleteRecord } = require('./commerce-record.service');

function cartKey({ sessionId, userId }) {
  return userId ? `user:${userId}` : `session:${sessionId || 'guest'}`;
}

function emptyCart({ sessionId, userId }) {
  return { id: cartKey({ sessionId, userId }), sessionId: sessionId || null, userId: userId || null, items: [] };
}

async function readCart({ sessionId, userId }) {
  if (!databaseEnabled) return getCart({ sessionId, userId });
  return (await getRecord('cart', cartKey({ sessionId, userId }))) || emptyCart({ sessionId, userId });
}

async function writeCart(cart) {
  if (databaseEnabled) await saveRecord('cart', cart.id, cart);
  return cart;
}

function withTotals(cart) {
  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price || 0) * Number(item.quantity || 0), 0);
  const totalItems = cart.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  return { ...cart, subtotal, packagingCost: 0, total: subtotal, totalItems };
}

async function getCustomerCart({ sessionId, userId }) {
  return withTotals(await readCart({ sessionId, userId }));
}

async function addProductToCart({ sessionId, userId, productId, quantity = 1, customizations = {}, customBox }) {
  const normalizedQuantity = Number(quantity);
  if (!Number.isInteger(normalizedQuantity) || normalizedQuantity <= 0) {
    const error = new Error('Quantity must be a positive whole number.');
    error.statusCode = 400;
    throw error;
  }
  const product = customBox ? createCustomBoxProduct(customBox) : await findProductById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  if (!databaseEnabled) {
    return withTotals(addItemToCart({ sessionId, userId, product, quantity: normalizedQuantity, customizations: { ...customizations, ...(customBox ? { customBox } : {}) } }));
  }

  const cart = await readCart({ sessionId, userId });
  const existingItem = cart.items.find((item) => item.productId === product.id &&
    JSON.stringify(item.customizations || {}) === JSON.stringify({ ...customizations, ...(customBox ? { customBox } : {}) }));
  if (existingItem) existingItem.quantity += normalizedQuantity;
  else cart.items.push({
    id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    productId: product.id,
    product,
    quantity: normalizedQuantity,
    customizations: { ...customizations, ...(customBox ? { customBox } : {}) },
  });
  return withTotals(await writeCart(cart));
}

async function updateProductQuantity({ sessionId, userId, itemId, delta }) {
  const normalizedDelta = Number(delta);
  if (!Number.isInteger(normalizedDelta)) {
    const error = new Error('Quantity change must be a whole number.');
    error.statusCode = 400;
    throw error;
  }
  if (!databaseEnabled) {
    const cart = updateCartItemQuantity({ sessionId, userId, itemId, delta: normalizedDelta });
    if (!cart) {
      const error = new Error('Cart item not found');
      error.statusCode = 404;
      throw error;
    }
    return withTotals(cart);
  }
  const cart = await readCart({ sessionId, userId });
  const item = cart.items.find((entry) => entry.id === itemId);
  if (!item) {
    const error = new Error('Cart item not found');
    error.statusCode = 404;
    throw error;
  }
  item.quantity += normalizedDelta;
  if (item.quantity <= 0) cart.items = cart.items.filter((entry) => entry.id !== itemId);
  return withTotals(await writeCart(cart));
}

async function removeProductFromCart({ sessionId, userId, itemId }) {
  if (!databaseEnabled) return withTotals(removeCartItem({ sessionId, userId, itemId }));
  const cart = await readCart({ sessionId, userId });
  cart.items = cart.items.filter((item) => item.id !== itemId);
  return withTotals(await writeCart(cart));
}

async function clearCustomerCart({ sessionId, userId }) {
  if (!databaseEnabled) return withTotals(clearCart({ sessionId, userId }));
  const cart = await readCart({ sessionId, userId });
  cart.items = [];
  return withTotals(await writeCart(cart));
}

async function mergeCartForUser(sessionId, userId) {
  if (!databaseEnabled) return withTotals(mergeGuestCartToUser(sessionId, userId));
  if (!sessionId) return getCustomerCart({ userId });

  const guestKey = cartKey({ sessionId });
  const guestCart = await getRecord('cart', guestKey);
  const userCart = await readCart({ userId });
  if (guestCart) {
    for (const item of guestCart.items) {
      const existing = userCart.items.find((entry) => entry.productId === item.productId &&
        JSON.stringify(entry.customizations || {}) === JSON.stringify(item.customizations || {}));
      if (existing) existing.quantity += item.quantity;
      else userCart.items.push({ ...item, id: `item-${Date.now()}-${Math.random().toString(36).slice(2, 9)}` });
    }
    await writeCart(userCart);
    await deleteRecord('cart', guestKey);
  }
  return withTotals(userCart);
}

module.exports = {
  getCustomerCart,
  addProductToCart,
  updateProductQuantity,
  removeProductFromCart,
  clearCustomerCart,
  mergeCartForUser,
};
