const express = require('express');
const {
	getAdminSummary,
	listAdminProducts,
	createAdminProduct,
	updateAdminProduct,
	archiveAdminProduct,
	listAdminCustomers,
	updateAdminCustomer,
	getAdminSettings,
	updateAdminSettings,
} = require('../controllers/admin.controller');
const { getOrders, updateOrder } = require('../controllers/checkout.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate, requireAdmin);
router.get('/summary', getAdminSummary);
router.get('/orders', getOrders);
router.patch('/orders/:orderId', updateOrder);
router.get('/products', listAdminProducts);
router.post('/products', createAdminProduct);
router.patch('/products/:productId', updateAdminProduct);
router.delete('/products/:productId', archiveAdminProduct);
router.get('/customers', listAdminCustomers);
router.patch('/customers/:customerId', updateAdminCustomer);
router.get('/settings', getAdminSettings);
router.put('/settings', updateAdminSettings);

module.exports = router;
