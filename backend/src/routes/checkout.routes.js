const express = require('express');
const { createCheckoutOrder, getCheckoutQuote, getOrders, updateOrder, getOrderById } = require('../controllers/checkout.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/quote', authenticate, getCheckoutQuote);
router.post('/', authenticate, createCheckoutOrder);
router.get('/orders', authenticate, getOrders);
router.patch('/orders/:orderId', authenticate, requireAdmin, updateOrder);
router.get('/orders/:orderId', authenticate, getOrderById);

module.exports = router;
