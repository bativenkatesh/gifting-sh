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

    assert.equal(checkoutResponse.statusCode, 200);
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
      body: { name: 'Test Gift Box', sku: 'TEST-BOX', category: 'Test', price: 50, stockQuantity: 10, lowStockThreshold: 2 },
    });
    assert.equal(createdProduct.statusCode, 201);
    const productId = createdProduct.body.data.product.id;

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
