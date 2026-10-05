const express = require('express');
const { readCurrentCart, addItem, updateItem, deleteItem, clearCart, mergeGuestCart } = require('../controllers/cart.controller');
const { authenticate, optionalAuthenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', optionalAuthenticate, readCurrentCart);
router.post('/items', optionalAuthenticate, addItem);
router.patch('/items/:itemId', optionalAuthenticate, updateItem);
router.delete('/items/:itemId', optionalAuthenticate, deleteItem);
router.delete('/clear', optionalAuthenticate, clearCart);
router.post('/merge', authenticate, mergeGuestCart);

module.exports = router;
