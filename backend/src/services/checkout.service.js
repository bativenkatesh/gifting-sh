const { getCart, clearCart, carts } = require('../data/inMemoryStore');
const { findProductById, reserveProductStock } = require('./catalog.service');
const { getStoreSettings } = require('./settings.service');

function normalizeAddress(address = {}) {
  return {
    fullName: address.fullName || '',
    addressLine1: address.addressLine1 || '',
    city: address.city || '',
    state: address.state || '',
    postalCode: address.postalCode || '',
    country: address.country || '',
  };
}

function calculateOrderTotals(items, settings) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.product.price || 0) * Number(item.quantity || 0), 0);
  const shippingAmount = Number(settings.flatShipping || 0);
  const taxAmount = Number((subtotal * Number(settings.taxRate || 0) / 100).toFixed(2));
  const total = subtotal + shippingAmount + taxAmount;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    shippingAmount: Number(shippingAmount.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

function resolveCheckoutCart({ sessionId, userId }) {
  const explicitCart = getCart({ sessionId, userId });
  if (explicitCart.items.length > 0) {
    return explicitCart;
  }

  const fallbackCart = [...carts.values()].find((cart) => cart.items.length > 0 && cart.userId === userId && cart.sessionId === sessionId);
  if (fallbackCart) {
    return fallbackCart;
  }

  if (!userId) {
    const guestCart = [...carts.values()].find((cart) => cart.items.length > 0 && cart.userId === null);
    if (guestCart) {
      return guestCart;
    }
  }

  return explicitCart;
}

async function createOrderFromCart({ user, email, shippingAddress, billingAddress, giftMessage, sessionId, userId, paymentMethod = 'manual' }) {
  const settings = await getStoreSettings();
  const cart = resolveCheckoutCart({ sessionId, userId: user?.id || userId || null });

  if (!cart || cart.items.length === 0) {
    const error = new Error('Your cart is empty.');
    error.statusCode = 400;
    throw error;
  }

  const items = cart.items.map((item) => {
    const product = findProductById(item.productId);
    if (!product) {
      const error = new Error(`Product ${item.productId} is no longer available.`);
      error.statusCode = 400;
      throw error;
    }

    return {
      id: item.id,
      productId: product.id,
      productName: product.name,
      unitPrice: Number(product.price),
      quantity: item.quantity,
      customizations: item.customizations || {},
      giftMessage: giftMessage || item.customizations?.calligraphyNote || '',
    };
  });

  const totals = calculateOrderTotals(items.map((item) => ({
    product: { price: item.unitPrice },
    quantity: item.quantity,
  })), settings);

  const order = {
    id: `ord-${Date.now()}`,
    orderNumber: `SH-${Math.floor(100000 + Math.random() * 900000)}`,
    userId: user?.id || userId || null,
    email: email || user?.email || '',
    status: 'pending_payment',
    paymentStatus: paymentMethod === 'manual' ? 'pending' : 'not_started',
    paymentProvider: 'manual',
    paymentReference: null,
    subtotal: totals.subtotal,
    discountAmount: 0,
    shippingAmount: totals.shippingAmount,
    taxAmount: totals.taxAmount,
    total: totals.total,
    currency: settings.currency,
    shippingAddress: normalizeAddress(shippingAddress),
    billingAddress: normalizeAddress(billingAddress),
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    giftMessage: giftMessage || '',
    createdAt: new Date().toISOString(),
    items,
    lastUpdated: new Date().toISOString(),
  };

  reserveProductStock(items);
  clearCart({ sessionId: cart.sessionId, userId: cart.userId });
  return order;
}

module.exports = { createOrderFromCart };
