const assert = require('node:assert/strict');
const test = require('node:test');
const http = require('node:http');
const jwt = require('jsonwebtoken');
process.env.NODE_ENV = 'test';
const app = require('../src/app');

function request(server, path) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const request = http.get(`http://127.0.0.1:${address.port}${path}`, (response) => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => resolve({ statusCode: response.statusCode, body: JSON.parse(body) }));
    });
    request.on('error', reject);
  });
}

function requestJson(server, path, { method = 'GET', body, headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const address = server.address();
    const req = http.request(`http://127.0.0.1:${address.port}${path}`, {
      method,
      headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers },
    }, (response) => {
      let responseBody = '';
      response.setEncoding('utf8');
      response.on('data', (chunk) => { responseBody += chunk; });
      response.on('end', () => resolve({ statusCode: response.statusCode, body: JSON.parse(responseBody) }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

test('GET /api/v1/health returns service health', async () => {
  const server = app.listen(0);

  try {
    const response = await request(server, '/api/v1/health');
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.status, 'ok');
  } finally {
    server.close();
  }
});

test('unknown routes return a JSON 404 response', async () => {
  const server = app.listen(0);

  try {
    const response = await request(server, '/api/v1/missing');
    assert.equal(response.statusCode, 404);
    assert.equal(response.body.success, false);
  } finally {
    server.close();
  }
});

test('POST /api/v1/auth/signup creates a user and token', async () => {
  const server = app.listen(0);

  try {
    const response = await new Promise((resolve, reject) => {
      const address = server.address();
      const req = http.request(`http://127.0.0.1:${address.port}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(body) }));
      });
      req.on('error', reject);
      req.write(JSON.stringify({ name: 'Ada Lovelace', email: 'ada@example.com', password: 'secret123' }));
      req.end();
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.body.success, true);
    assert.equal(typeof response.body.data.token, 'string');
    assert.equal(response.body.data.user.email, 'ada@example.com');
  } finally {
    server.close();
  }
});

test('GET /api/v1/products returns a catalog array', async () => {
  const server = app.listen(0);

  try {
    const response = await request(server, '/api/v1/products');
    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
    assert.ok(Array.isArray(response.body.data.products));
    assert.ok(response.body.data.products.length > 0);
  } finally {
    server.close();
  }
});

test('POST /api/v1/cart/items adds a product to the cart', async () => {
  const server = app.listen(0);

  try {
    const response = await new Promise((resolve, reject) => {
      const address = server.address();
      const req = http.request(`http://127.0.0.1:${address.port}/api/v1/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(body) }));
      });
      req.on('error', reject);
      req.write(JSON.stringify({ productId: 'box-1', quantity: 2, sessionId: 'test-session' }));
      req.end();
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
    assert.equal(response.body.data.cart.items.length, 1);
    assert.equal(response.body.data.cart.items[0].productId, 'box-1');
  } finally {
    server.close();
  }
});

test('POST /api/v1/checkout creates an order from the cart', async () => {
  const server = app.listen(0);

  try {
    const signupResponse = await new Promise((resolve, reject) => {
      const address = server.address();
      const req = http.request(`http://127.0.0.1:${address.port}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(body) }));
      });
      req.on('error', reject);
      req.write(JSON.stringify({ name: 'Checkout User', email: 'checkout@example.com', password: 'secret123' }));
      req.end();
    });

    const token = signupResponse.body.data.token;
    const cartResponse = await new Promise((resolve, reject) => {
      const address = server.address();
      const req = http.request(`http://127.0.0.1:${address.port}/api/v1/cart/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      }, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(body) }));
      });
      req.on('error', reject);
      req.write(JSON.stringify({ productId: 'box-2', quantity: 1 }));
      req.end();
    });

    assert.equal(cartResponse.statusCode, 200);

    const checkoutResponse = await new Promise((resolve, reject) => {
      const address = server.address();
      const req = http.request(`http://127.0.0.1:${address.port}/api/v1/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      }, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(body) }));
      });
      req.on('error', reject);
      req.write(JSON.stringify({
        email: 'checkout@example.com',
        shippingAddress: { fullName: 'Checkout User', addressLine1: '12 Main St', city: 'London', state: 'England', postalCode: 'SW1A 1AA', country: 'UK' },
        billingAddress: { fullName: 'Checkout User', addressLine1: '12 Main St', city: 'London', state: 'England', postalCode: 'SW1A 1AA', country: 'UK' },
        giftMessage: 'With love',
      }));
      req.end();
    });

    assert.equal(checkoutResponse.statusCode, 201);
    assert.equal(checkoutResponse.body.success, true);
    assert.equal(checkoutResponse.body.data.order.status, 'pending_payment');
    assert.equal(checkoutResponse.body.data.order.items.length, 1);
  } finally {
    server.close();
  }
});

test('GET /api/v1/admin/orders returns orders for admin', async () => {
  const server = app.listen(0);

  try {
    const signupResponse = await new Promise((resolve, reject) => {
      const address = server.address();
      const req = http.request(`http://127.0.0.1:${address.port}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(body) }));
      });
      req.on('error', reject);
      req.write(JSON.stringify({ name: 'Admin User', email: 'admin@example.com', password: 'secret123' }));
      req.end();
    });

    const token = signupResponse.body.data.token;
    const adminToken = jwt.sign({ sub: signupResponse.body.data.user.id, email: signupResponse.body.data.user.email, role: 'admin' }, process.env.JWT_SECRET || 'development-only-change-me');

    const response = await new Promise((resolve, reject) => {
      const address = server.address();
      const req = http.request(`http://127.0.0.1:${address.port}/api/v1/admin/orders`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${adminToken}` },
      }, (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { body += chunk; });
        res.on('end', () => resolve({ statusCode: res.statusCode, body: JSON.parse(body) }));
      });
      req.on('error', reject);
      req.end();
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.body.success, true);
    assert.ok(Array.isArray(response.body.data.orders));
  } finally {
    server.close();
  }
});

test('admin can manage catalog, inventory, customers, and store settings', async () => {
  const server = app.listen(0);
  const token = jwt.sign({ sub: 'admin-test', email: 'admin@example.com', role: 'admin' }, process.env.JWT_SECRET || 'development-only-change-me');
  const headers = { Authorization: `Bearer ${token}` };

  try {
    const settingsResponse = await requestJson(server, '/api/v1/admin/settings', { headers });
    assert.equal(settingsResponse.statusCode, 200);
    assert.equal(settingsResponse.body.data.settings.currency, 'INR');

    const updatedSettings = await requestJson(server, '/api/v1/admin/settings', {
      method: 'PUT', headers,
      body: { storeName: 'Test Atelier', supportEmail: 'support@example.com', currency: 'USD', taxRate: 8.5, flatShipping: 12, lowStockThreshold: 3 },
    });
    assert.equal(updatedSettings.statusCode, 200);
    assert.equal(updatedSettings.body.data.settings.currency, 'USD');

    const createdProduct = await requestJson(server, '/api/v1/admin/products', {
      method: 'POST', headers,
      body: { name: 'Test Gift Box', sku: 'TEST-BOX', category: 'Test', price: 50, stockQuantity: 10, lowStockThreshold: 2, image: 'data:image/png;base64,aGVsbG8=' },
    });
    assert.equal(createdProduct.statusCode, 201);
    const productId = createdProduct.body.data.product.id;
    assert.equal(createdProduct.body.data.product.image, 'data:image/png;base64,aGVsbG8=');

    const rejectedImage = await requestJson(server, `/api/v1/admin/products/${productId}`, {
      method: 'PATCH', headers,
      body: { ...createdProduct.body.data.product, image: 'data:image/svg+xml;base64,PHN2Zz4=' },
    });
    assert.equal(rejectedImage.statusCode, 400);

    const updatedProduct = await requestJson(server, `/api/v1/admin/products/${productId}`, {
      method: 'PATCH', headers,
      body: { ...createdProduct.body.data.product, stockQuantity: 4, price: 55 },
    });
    assert.equal(updatedProduct.statusCode, 200);
    assert.equal(updatedProduct.body.data.product.stockQuantity, 4);

    const customerResponse = await requestJson(server, '/api/v1/admin/customers', { headers });
    assert.equal(customerResponse.statusCode, 200);
    assert.ok(Array.isArray(customerResponse.body.data.customers));
    const customer = customerResponse.body.data.customers[0];
    if (customer) {
      const deactivated = await requestJson(server, `/api/v1/admin/customers/${customer.id}`, {
        method: 'PATCH', headers, body: { isActive: false },
      });
      assert.equal(deactivated.statusCode, 200);
      assert.equal(deactivated.body.data.customer.isActive, false);
    }

    const archivedProduct = await requestJson(server, `/api/v1/admin/products/${productId}`, { method: 'DELETE', headers });
    assert.equal(archivedProduct.statusCode, 200);
    assert.equal(archivedProduct.body.data.product.status, 'archived');

    const userResponse = await requestJson(server, '/api/v1/admin/summary', {
      headers: { Authorization: `Bearer ${jwt.sign({ sub: 'user-test', email: 'user@example.com', role: 'user' }, process.env.JWT_SECRET || 'development-only-change-me')}` },
    });
    assert.equal(userResponse.statusCode, 403);
  } finally {
    server.close();
  }
});

test('customers cannot read another customer\'s order by ID', async () => {
  const server = app.listen(0);

  try {
    const customerA = await requestJson(server, '/api/v1/auth/signup', {
      method: 'POST', body: { name: 'Customer A', email: 'customer-a@example.com', password: 'secret123' },
    });
    const customerB = await requestJson(server, '/api/v1/auth/signup', {
      method: 'POST', body: { name: 'Customer B', email: 'customer-b@example.com', password: 'secret123' },
    });
    const headersA = { Authorization: `Bearer ${customerA.body.data.token}` };
    const headersB = { Authorization: `Bearer ${customerB.body.data.token}` };

    await requestJson(server, '/api/v1/cart/items', {
      method: 'POST', headers: headersA, body: { productId: 'box-1', quantity: 1 },
    });
    const checkout = await requestJson(server, '/api/v1/checkout', {
      method: 'POST', headers: headersA,
      body: { email: 'customer-a@example.com', shippingAddress: { fullName: 'Customer A', addressLine1: '1 Main Street', city: 'London', state: 'England', postalCode: 'SW1A 1AA', country: 'UK' } },
    });
    const orderId = checkout.body.data.order.id;

    const forbidden = await requestJson(server, `/api/v1/checkout/orders/${orderId}`, { headers: headersB });
    const allowed = await requestJson(server, `/api/v1/checkout/orders/${orderId}`, { headers: headersA });
    assert.equal(forbidden.statusCode, 404);
    assert.equal(allowed.statusCode, 200);

    const adminHeaders = { Authorization: `Bearer ${jwt.sign({ sub: 'fulfillment-admin', email: 'admin@example.com', role: 'admin' }, process.env.JWT_SECRET || 'development-only-change-me')}` };
    const missingTracking = await requestJson(server, `/api/v1/admin/orders/${orderId}`, {
      method: 'PATCH', headers: adminHeaders, body: { status: 'shipped' },
    });
    assert.equal(missingTracking.statusCode, 400);
    const shipped = await requestJson(server, `/api/v1/admin/orders/${orderId}`, {
      method: 'PATCH', headers: adminHeaders, body: { status: 'shipped', carrier: 'Parcel Post', trackingNumber: 'TRACK-123' },
    });
    assert.equal(shipped.statusCode, 200);
    const notifications = await requestJson(server, '/api/v1/account/notifications', { headers: headersA });
    assert.equal(notifications.body.data.notifications[0].trackingNumber, 'TRACK-123');
  } finally {
    server.close();
  }
});

test('customer services validate and persist newsletter, address, wishlist, and review data', async () => {
  const server = app.listen(0);

  try {
    const signup = await requestJson(server, '/api/v1/auth/signup', {
      method: 'POST', body: { name: 'Service Customer', email: 'service-customer@example.com', password: 'secret123' },
    });
    const headers = { Authorization: `Bearer ${signup.body.data.token}` };
    const newsletter = await requestJson(server, '/api/v1/newsletter/subscribe', {
      method: 'POST', body: { email: ' SERVICE@example.com ' },
    });
    assert.equal(newsletter.statusCode, 201);
    assert.equal(newsletter.body.data.email, 'service@example.com');

    const address = { fullName: 'Service Customer', addressLine1: '2 Main Street', city: 'London', state: 'England', postalCode: 'SW1A 1AA', country: 'UK' };
    const savedAddress = await requestJson(server, '/api/v1/account/addresses', { method: 'PUT', headers, body: { address } });
    assert.equal(savedAddress.body.data.addresses.length, 1);

    const wishlist = await requestJson(server, '/api/v1/account/wishlist', { method: 'POST', headers, body: { productId: 'box-2' } });
    assert.deepEqual(wishlist.body.data.productIds, ['box-2']);

    const review = await requestJson(server, '/api/v1/products/box-2/reviews', {
      method: 'POST', headers, body: { rating: 5, title: 'Thoughtful gift', body: 'Beautifully presented.' },
    });
    assert.equal(review.statusCode, 201);
    assert.equal(review.body.data.review.status, 'pending');
    const publishedReviews = await requestJson(server, '/api/v1/products/box-2/reviews');
    assert.equal(publishedReviews.body.data.reviews.length, 0);

    const adminHeaders = { Authorization: `Bearer ${jwt.sign({ sub: 'review-admin', email: 'admin@example.com', role: 'admin' }, process.env.JWT_SECRET || 'development-only-change-me')}` };
    const moderationQueue = await requestJson(server, '/api/v1/admin/reviews', { headers: adminHeaders });
    assert.equal(moderationQueue.body.data.reviews.length, 1);
    const approved = await requestJson(server, `/api/v1/admin/reviews/${encodeURIComponent(review.body.data.review.id)}`, {
      method: 'PATCH', headers: adminHeaders, body: { status: 'approved' },
    });
    assert.equal(approved.body.data.review.status, 'approved');
    const visibleReviews = await requestJson(server, '/api/v1/products/box-2/reviews');
    assert.equal(visibleReviews.body.data.reviews.length, 1);
  } finally {
    server.close();
  }
});

test('admin coupons are applied to server-calculated checkout totals', async () => {
  const server = app.listen(0);
  const adminToken = jwt.sign({ sub: 'coupon-admin', email: 'admin@example.com', role: 'admin' }, process.env.JWT_SECRET || 'development-only-change-me');
  const adminHeaders = { Authorization: `Bearer ${adminToken}` };

  try {
    const createdCoupon = await requestJson(server, '/api/v1/admin/coupons', {
      method: 'POST', headers: adminHeaders,
      body: { code: 'WELCOME10', discountType: 'percent', discountValue: 10 },
    });
    assert.equal(createdCoupon.statusCode, 201);

    const signup = await requestJson(server, '/api/v1/auth/signup', {
      method: 'POST', body: { name: 'Coupon Customer', email: 'coupon-customer@example.com', password: 'secret123' },
    });
    const customerHeaders = { Authorization: `Bearer ${signup.body.data.token}` };
    await requestJson(server, '/api/v1/cart/items', {
      method: 'POST', headers: customerHeaders, body: { productId: 'box-4', quantity: 1 },
    });
    const quote = await requestJson(server, '/api/v1/checkout/quote?couponCode=WELCOME10', { headers: customerHeaders });
    assert.equal(quote.statusCode, 200);
    assert.equal(quote.body.data.quote.discountAmount, 31);
    const checkout = await requestJson(server, '/api/v1/checkout', {
      method: 'POST', headers: customerHeaders,
      body: {
        email: 'coupon-customer@example.com', couponCode: 'welcome10',
        shippingAddress: { fullName: 'Coupon Customer', addressLine1: '3 Main Street', city: 'London', state: 'England', postalCode: 'SW1A 1AA', country: 'UK' },
      },
    });
    assert.equal(checkout.statusCode, 201);
    assert.equal(checkout.body.data.order.discountAmount, 31);
    assert.equal(checkout.body.data.order.couponCode, 'WELCOME10');
    assert.equal(checkout.body.data.order.total, quote.body.data.quote.total);
  } finally {
    server.close();
  }
});

test('password reset tokens update passwords once and reject replay', async () => {
  const server = app.listen(0);

  try {
    await requestJson(server, '/api/v1/auth/signup', {
      method: 'POST', body: { name: 'Reset Customer', email: 'reset-customer@example.com', password: 'secret123' },
    });
    const request = await requestJson(server, '/api/v1/auth/password-reset/request', {
      method: 'POST', body: { email: 'reset-customer@example.com' },
    });
    const token = request.body.data.developmentToken;
    assert.equal(request.statusCode, 202);
    assert.ok(token);

    const reset = await requestJson(server, '/api/v1/auth/password-reset/confirm', {
      method: 'POST', body: { token, password: 'newsecret123' },
    });
    assert.equal(reset.statusCode, 200);
    const replay = await requestJson(server, '/api/v1/auth/password-reset/confirm', {
      method: 'POST', body: { token, password: 'othersecret123' },
    });
    assert.equal(replay.statusCode, 400);

    const login = await requestJson(server, '/api/v1/auth/login', {
      method: 'POST', body: { email: 'reset-customer@example.com', password: 'newsecret123' },
    });
    assert.equal(login.statusCode, 200);
  } finally {
    server.close();
  }
});

test('invalid delivery details do not reserve inventory or clear the cart', async () => {
  const server = app.listen(0);

  try {
    const signup = await requestJson(server, '/api/v1/auth/signup', {
      method: 'POST', body: { name: 'Address Customer', email: 'address-customer@example.com', password: 'secret123' },
    });
    const headers = { Authorization: `Bearer ${signup.body.data.token}` };
    await requestJson(server, '/api/v1/cart/items', { method: 'POST', headers, body: { productId: 'box-1', quantity: 1 } });
    const before = await requestJson(server, '/api/v1/products/box-1');
    const checkout = await requestJson(server, '/api/v1/checkout', {
      method: 'POST', headers,
      body: { email: 'address-customer@example.com', shippingAddress: { fullName: 'Address Customer', country: 'UK' } },
    });
    const after = await requestJson(server, '/api/v1/products/box-1');
    const cart = await requestJson(server, '/api/v1/cart', { headers });
    assert.equal(checkout.statusCode, 400);
    assert.equal(after.body.data.product.stockQuantity, before.body.data.product.stockQuantity);
    assert.equal(cart.body.data.cart.items.length, 1);
  } finally {
    server.close();
  }
});

test('bespoke boxes are server-priced and can be checked out', async () => {
  const server = app.listen(0);

  try {
    const signup = await requestJson(server, '/api/v1/auth/signup', {
      method: 'POST', body: { name: 'Bespoke Customer', email: 'bespoke-customer@example.com', password: 'secret123' },
    });
    const headers = { Authorization: `Bearer ${signup.body.data.token}` };
    const invalidOptions = await requestJson(server, '/api/v1/cart/items', {
      method: 'POST', headers, body: { customBox: { boxId: 'unknown', addonIds: [] }, quantity: 1 },
    });
    assert.equal(invalidOptions.statusCode, 400);

    const cartResponse = await requestJson(server, '/api/v1/cart/items', {
      method: 'POST', headers,
      body: { productId: 'client-price-is-ignored', customBox: { boxId: 'linen-cream', addonIds: ['b-1', 'b-3'] }, quantity: 1 },
    });
    assert.equal(cartResponse.statusCode, 200);
    assert.equal(cartResponse.body.data.cart.items[0].product.price, 65);

    const checkout = await requestJson(server, '/api/v1/checkout', {
      method: 'POST', headers,
      body: {
        email: 'bespoke-customer@example.com',
        shippingAddress: { fullName: 'Bespoke Customer', addressLine1: '4 Main Street', city: 'London', state: 'England', postalCode: 'SW1A 1AA', country: 'UK' },
      },
    });
    assert.equal(checkout.statusCode, 201);
    assert.equal(checkout.body.data.order.subtotal, 65);
    assert.equal(checkout.body.data.order.items[0].productName, 'Bespoke Signature Ivory Linen Box');
  } finally {
    server.close();
  }
});

test('email verification tokens are one-time and expire-aware', async () => {
  const server = app.listen(0);

  try {
    const signup = await requestJson(server, '/api/v1/auth/signup', {
      method: 'POST', body: { name: 'Verify Customer', email: 'verify-customer@example.com', password: 'secret123' },
    });
    const { createActionToken } = require('../src/services/auth-token.service');
    const token = await createActionToken({ userId: signup.body.data.user.id, type: 'verify-email' });
    const verified = await requestJson(server, '/api/v1/auth/verify-email', { method: 'POST', body: { token } });
    assert.equal(verified.statusCode, 200);
    assert.equal(verified.body.data.user.isVerified, true);
    const replay = await requestJson(server, '/api/v1/auth/verify-email', { method: 'POST', body: { token } });
    assert.equal(replay.statusCode, 400);
  } finally {
    server.close();
  }
});
