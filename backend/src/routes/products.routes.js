const express = require('express');
const { listProducts, getProductById } = require('../controllers/products.controller');

const router = express.Router();

router.get('/', listProducts);
router.get('/:productId', getProductById);

module.exports = router;
