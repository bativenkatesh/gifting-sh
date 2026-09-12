const assert = require('node:assert/strict');
const test = require('node:test');
const http = require('node:http');
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
