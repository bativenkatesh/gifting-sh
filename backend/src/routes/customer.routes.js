const express = require('express');
const {
  subscribeNewsletter,
  getAddresses,
  putAddress,
  deleteAddress,
  getWishlistItems,
  addWishlistItem,
  deleteWishlistItem,
  submitReview,
  getProductReviews,
  getNotifications,
} = require('../controllers/customer.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.post('/newsletter/subscribe', subscribeNewsletter);
router.get('/products/:productId/reviews', getProductReviews);
router.post('/products/:productId/reviews', authenticate, submitReview);
router.get('/account/addresses', authenticate, getAddresses);
router.get('/account/notifications', authenticate, getNotifications);
router.put('/account/addresses', authenticate, putAddress);
router.delete('/account/addresses/:addressId', authenticate, deleteAddress);
router.get('/account/wishlist', authenticate, getWishlistItems);
router.post('/account/wishlist', authenticate, addWishlistItem);
router.delete('/account/wishlist/:productId', authenticate, deleteWishlistItem);

module.exports = router;
