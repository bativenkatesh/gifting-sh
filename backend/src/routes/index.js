const express = require('express');
const authRoutes = require('./auth.routes');
const healthRoutes = require('./health.routes');
const productsRoutes = require('./products.routes');
const cartRoutes = require('./cart.routes');
const checkoutRoutes = require('./checkout.routes');
const adminRoutes = require('./admin.routes');
const customerRoutes = require('./customer.routes');
const storeRoutes = require('./store.routes');

const router = express.Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/cart', cartRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/admin', adminRoutes);
router.use('/', customerRoutes);
router.use('/', storeRoutes);

module.exports = router;
