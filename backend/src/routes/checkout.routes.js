const express = require('express');
const { createCheckoutOrder, getOrders, updateOrder, getOrderById } = require('../controllers/checkout.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/', authenticate, createCheckoutOrder);
router.get('/orders', authenticate, getOrders);
router.patch('/orders/:orderId', authenticate, requireAdmin, updateOrder);
router.get('/orders/:orderId', authenticate, getOrderById);

module.exports = router;
