const { getCatalogProducts, findProductById } = require('../services/catalog.service');
const { listProductReviews } = require('../services/customer.service');

async function listProducts(_req, res) {
  const products = await getCatalogProducts();
  return res.status(200).json({
    success: true,
    data: { products, total: products.length },
  });
}

async function getProductById(req, res, next) {
  try {
    const product = await findProductById(req.params.productId);
    if (!product) {
      return res.status(404).json({ success: false, error: { message: 'Product not found.' } });
    }

    const reviews = await listProductReviews(product.id);
    return res.status(200).json({ success: true, data: { product, reviews } });
  } catch (error) {
    return next(error);
  }
}

module.exports = { listProducts, getProductById };
