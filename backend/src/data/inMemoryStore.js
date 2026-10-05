const users = [];
const carts = new Map();
const orders = [];

function makeId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getCartKey({ sessionId, userId }) {
  if (userId) return `user:${userId}`;
  return `session:${sessionId || 'guest'}`;
}

function getCart({ sessionId, userId }) {
  const key = getCartKey({ sessionId, userId });
  if (!carts.has(key)) {
    carts.set(key, { id: key, sessionId: sessionId || null, userId: userId || null, items: [] });
  }
  return carts.get(key);
}

function cloneCart(cart) {
  return {
    id: cart.id,
    sessionId: cart.sessionId,
    userId: cart.userId,
    items: cart.items.map((item) => ({ ...item, product: { ...item.product } })),
  };
}

function findUserByEmail(email) {
  return users.find((user) => user.email === email.toLowerCase());
}

function createUser({ name, email, passwordHash, role = 'user', isVerified = false, requiresEmailVerification = false }) {
  const user = {
    id: makeId('user'),
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    isVerified,
    requiresEmailVerification,
    isActive: true,
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  return user;
}

function findUserById(userId) {
  return users.find((user) => user.id === userId) || null;
}

function updateUserVerification(userId, isVerified) {
  const user = findUserById(userId);
  if (!user) return null;
  user.isVerified = isVerified;
  user.requiresEmailVerification = false;
  return user;
}

function updateUserPassword(userId, passwordHash) {
  const user = findUserById(userId);
  if (!user) return null;
  user.passwordHash = passwordHash;
  return user;
}

function addItemToCart({ sessionId, userId, product, quantity = 1, customizations = {} }) {
  const cart = getCart({ sessionId, userId });
  const existingItem = cart.items.find((item) => {
    if (item.productId !== product.id) return false;
    return JSON.stringify(item.customizations || {}) === JSON.stringify(customizations || {});
  });

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.items.push({
      id: makeId('item'),
      productId: product.id,
      product,
      quantity,
      customizations,
    });
  }

  return cloneCart(cart);
}

function updateCartItemQuantity({ sessionId, userId, itemId, delta }) {
  const cart = getCart({ sessionId, userId });
  const item = cart.items.find((entry) => entry.id === itemId);
  if (!item) return null;

  const nextQuantity = item.quantity + delta;
  if (nextQuantity <= 0) {
    cart.items = cart.items.filter((entry) => entry.id !== itemId);
  } else {
    item.quantity = nextQuantity;
  }

  return cloneCart(cart);
}

function removeCartItem({ sessionId, userId, itemId }) {
  const cart = getCart({ sessionId, userId });
  cart.items = cart.items.filter((item) => item.id !== itemId);
  return cloneCart(cart);
}

function clearCart({ sessionId, userId }) {
  const cart = getCart({ sessionId, userId });
  cart.items = [];
  return cloneCart(cart);
}

function mergeGuestCartToUser(sessionId, userId) {
  if (!sessionId) {
    return getCart({ userId });
  }

  const guestCart = carts.get(`session:${sessionId}`);
  const userCart = getCart({ userId });

  if (!guestCart) {
    return cloneCart(userCart);
  }

  guestCart.items.forEach((item) => {
    const existing = userCart.items.find((entry) => entry.productId === item.productId && JSON.stringify(entry.customizations || {}) === JSON.stringify(item.customizations || {}));
    if (existing) {
      existing.quantity += item.quantity;
      return;
    }

    userCart.items.push({
      ...item,
      id: makeId('item'),
    });
  });

  carts.delete(`session:${sessionId}`);
  return cloneCart(userCart);
}

function createOrderRecord(order) {
  orders.push(order);
  return { ...order };
}

function listOrders({ userId, role }) {
  if (role === 'admin') {
    return orders.map((order) => ({ ...order }));
  }
  if (userId) {
    return orders.filter((order) => order.userId === userId).map((order) => ({ ...order }));
  }
  return [];
}

function findOrderById(orderId) {
  return orders.find((order) => order.id === orderId) || null;
}

function updateOrderStatus({ orderId, status, actor, trackingNumber, carrier }) {
  const order = orders.find((entry) => entry.id === orderId);
  if (!order) return null;

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

  order.status = status;
  if (trackingNumber !== undefined) order.trackingNumber = trackingNumber;
  if (carrier !== undefined) order.carrier = carrier;
  order.lastUpdated = new Date().toISOString();
  return { ...order };
}

function updateCustomerActiveStatus(userId, isActive) {
  const user = users.find((entry) => entry.id === userId && entry.role === 'user');
  if (!user) return null;
  user.isActive = isActive;
  return { ...user };
}

module.exports = {
  users,
  carts,
  orders,
  createUser,
  findUserByEmail,
  findUserById,
  updateUserVerification,
  updateUserPassword,
  addItemToCart,
  getCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  mergeGuestCartToUser,
  createOrderRecord,
  listOrders,
  findOrderById,
  updateOrderStatus,
  updateCustomerActiveStatus,
};
