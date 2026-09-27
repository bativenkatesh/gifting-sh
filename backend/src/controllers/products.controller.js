const { getCatalogProducts, findProductById } = require('../services/catalog.service');

function listProducts(_req, res) {
  const products = getCatalogProducts();
  return res.status(200).json({
    success: true,
    data: { products, total: products.length },
  });
}

function getProductById(req, res, next) {
  try {
    const product = findProductById(req.params.productId);
    if (!product) {
      return res.status(404).json({ success: false, error: { message: 'Product not found.' } });
    }

    return res.status(200).json({ success: true, data: { product } });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listProducts, getProductById };
