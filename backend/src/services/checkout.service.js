const { getCustomerCart, clearCustomerCart } = require('./cart.service');
const { findProductById, createCustomBoxProduct, reserveProductStock, restoreProductStock } = require('./catalog.service');
const { getStoreSettings } = require('./settings.service');
const { calculateCouponDiscount, saveCustomerAddress } = require('./customer.service');
const { createOrderRecord } = require('./orders.service');

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

function calculateOrderTotals(items, settings, discountAmount = 0) {
  const subtotal = items.reduce((sum, item) => sum + Number(item.product.price || 0) * Number(item.quantity || 0), 0);
  const shippingAmount = Number(settings.flatShipping || 0);
  const normalizedDiscount = Math.min(subtotal, Number(discountAmount || 0));
  const taxAmount = Number(((subtotal - normalizedDiscount) * Number(settings.taxRate || 0) / 100).toFixed(2));
  const total = subtotal - normalizedDiscount + shippingAmount + taxAmount;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discountAmount: Number(normalizedDiscount.toFixed(2)),
    shippingAmount: Number(shippingAmount.toFixed(2)),
    taxAmount: Number(taxAmount.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
}

async function quoteCart({ userId, sessionId, couponCode }) {
  const settings = await getStoreSettings();
  const cart = await getCustomerCart({ sessionId, userId });
  if (!cart.items.length) {
    const error = new Error('Your cart is empty.');
    error.statusCode = 400;
    throw error;
  }
  const items = [];
  for (const item of cart.items) {
    const product = item.customizations?.customBox
      ? createCustomBoxProduct(item.customizations.customBox)
      : await findProductById(item.productId);
    if (!product) {
      const error = new Error(`Product ${item.productId} is no longer available.`);
      error.statusCode = 400;
      throw error;
    }
    items.push({ product: { price: product.price }, quantity: item.quantity });
  }
  const subtotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0);
  const coupon = await calculateCouponDiscount(couponCode, subtotal);
  return { ...calculateOrderTotals(items, settings, coupon.discountAmount), currency: settings.currency, couponCode: coupon.coupon?.code || null };
}

async function createOrderFromCart({ user, email, shippingAddress, billingAddress, giftMessage, couponCode, sessionId, userId, paymentMethod = 'manual' }) {
  const settings = await getStoreSettings();
  const cart = await getCustomerCart({ sessionId, userId: user?.id || userId || null });

  if (!cart || cart.items.length === 0) {
    const error = new Error('Your cart is empty.');
    error.statusCode = 400;
    throw error;
  }

  const items = [];
  for (const item of cart.items) {
    const product = item.customizations?.customBox
      ? createCustomBoxProduct(item.customizations.customBox)
      : await findProductById(item.productId);
    if (!product) {
      const error = new Error(`Product ${item.productId} is no longer available.`);
      error.statusCode = 400;
      throw error;
    }

    items.push({
      id: item.id,
      productId: product.id,
      productName: product.name,
      unitPrice: Number(product.price),
      quantity: item.quantity,
      customizations: item.customizations || {},
      giftMessage: giftMessage || item.customizations?.calligraphyNote || '',
    });
  }

  const orderItems = items.map((item) => ({
    product: { price: item.unitPrice },
    quantity: item.quantity,
  }));
  const subtotal = orderItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const couponResult = await calculateCouponDiscount(couponCode, subtotal);
  const totals = calculateOrderTotals(orderItems, settings, couponResult.discountAmount);
  const normalizedShippingAddress = normalizeAddress(shippingAddress);
  const normalizedEmail = String(email || user?.email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || !normalizedShippingAddress.fullName ||
      !normalizedShippingAddress.addressLine1 || !normalizedShippingAddress.city ||
      !normalizedShippingAddress.postalCode || !normalizedShippingAddress.country) {
    const error = new Error('Enter a valid email and complete recipient and delivery address.');
    error.statusCode = 400;
    throw error;
  }

  const order = {
    id: `ord-${Date.now()}`,
    orderNumber: `SH-${Math.floor(100000 + Math.random() * 900000)}`,
    userId: user?.id || userId || null,
    email: normalizedEmail,
    status: 'pending_payment',
    paymentStatus: paymentMethod === 'manual' ? 'pending' : 'not_started',
    paymentProvider: 'manual',
    paymentReference: null,
    subtotal: totals.subtotal,
    discountAmount: totals.discountAmount,
    couponCode: couponResult.coupon?.code || null,
    shippingAmount: totals.shippingAmount,
    taxAmount: totals.taxAmount,
    total: totals.total,
    currency: settings.currency,
    shippingAddress: normalizedShippingAddress,
    billingAddress: normalizeAddress(billingAddress),
    deliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    giftMessage: giftMessage || '',
    createdAt: new Date().toISOString(),
    items,
    lastUpdated: new Date().toISOString(),
  };

  if (user?.id && shippingAddress) await saveCustomerAddress(user.id, normalizedShippingAddress);
  await reserveProductStock(items);
  let savedOrder;
  try {
    savedOrder = await createOrderRecord(order);
  } catch (error) {
    await restoreProductStock(items);
    throw error;
  }
  await clearCustomerCart({ sessionId: cart.sessionId, userId: cart.userId });
  return savedOrder;
}

module.exports = { createOrderFromCart, quoteCart };
