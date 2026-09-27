const { getCart, addItemToCart, updateCartItemQuantity, removeCartItem, clearCart, mergeGuestCartToUser } = require('../data/inMemoryStore');
const { findProductById } = require('./catalog.service');

function calculateCartTotals(cart) {
  const subtotal = cart.items.reduce((sum, item) => sum + Number(item.product.price || 0) * Number(item.quantity || 0), 0);
  const packagingCost = 0;
  return {
    subtotal,
    packagingCost,
    total: subtotal + packagingCost,
    totalItems: cart.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
  };
}

function getCustomerCart({ sessionId, userId }) {
  const cart = getCart({ sessionId, userId });
  return {
    ...cart,
    ...calculateCartTotals(cart),
  };
}

function addProductToCart({ sessionId, userId, productId, quantity = 1, customizations = {} }) {
  const product = findProductById(productId);
  if (!product) {
    const error = new Error('Product not found');
    error.statusCode = 404;
    throw error;
  }

  if (quantity <= 0) {
    const error = new Error('Quantity must be greater than zero');
    error.statusCode = 400;
    throw error;
  }

  const cart = addItemToCart({ sessionId, userId, product, quantity, customizations });
  return {
    ...cart,
    ...calculateCartTotals(cart),
  };
}

function updateProductQuantity({ sessionId, userId, itemId, delta }) {
  const cart = updateCartItemQuantity({ sessionId, userId, itemId, delta });
  if (!cart) {
    const error = new Error('Cart item not found');
    error.statusCode = 404;
    throw error;
  }

  return {
    ...cart,
    ...calculateCartTotals(cart),
  };
}

function removeProductFromCart({ sessionId, userId, itemId }) {
  const cart = removeCartItem({ sessionId, userId, itemId });
  return {
    ...cart,
    ...calculateCartTotals(cart),
  };
}

function clearCustomerCart({ sessionId, userId }) {
  const cart = clearCart({ sessionId, userId });
  return {
    ...cart,
    ...calculateCartTotals(cart),
  };
}

function mergeCartForUser(sessionId, userId) {
  const cart = mergeGuestCartToUser(sessionId, userId);
  return {
    ...cart,
    ...calculateCartTotals(cart),
  };
}

module.exports = {
  getCustomerCart,
  addProductToCart,
  updateProductQuantity,
  removeProductFromCart,
  clearCustomerCart,
  mergeCartForUser,
};
