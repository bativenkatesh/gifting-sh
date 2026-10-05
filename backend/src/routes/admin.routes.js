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
	listAdminCoupons,
	createAdminCoupon,
	deleteAdminCoupon,
	listAdminReviews,
	moderateAdminReview,
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
router.get('/coupons', listAdminCoupons);
router.post('/coupons', createAdminCoupon);
router.delete('/coupons/:code', deleteAdminCoupon);
router.get('/reviews', listAdminReviews);
router.patch('/reviews/:reviewId', moderateAdminReview);

module.exports = router;
