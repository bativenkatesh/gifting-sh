const { findProductById } = require('../services/catalog.service');
const {
  subscribeToNewsletter,
  getCustomerAddresses,
  saveCustomerAddress,
  deleteCustomerAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  createReview,
  listProductReviews,
} = require('../services/customer.service');
const { listCustomerNotifications } = require('../services/notification.service');

async function subscribeNewsletter(req, res, next) {
  try {
    const subscriber = await subscribeToNewsletter(req.body?.email);
    return res.status(201).json({ success: true, data: { subscribed: true, email: subscriber.email } });
  } catch (error) { return next(error); }
}

async function getAddresses(req, res) {
  return res.json({ success: true, data: { addresses: await getCustomerAddresses(req.user.id) } });
}

async function putAddress(req, res, next) {
  try {
    const addresses = await saveCustomerAddress(req.user.id, req.body?.address || {});
    return res.status(200).json({ success: true, data: { addresses } });
  } catch (error) { return next(error); }
}

async function deleteAddress(req, res) {
  const addresses = await deleteCustomerAddress(req.user.id, req.params.addressId);
  return res.json({ success: true, data: { addresses } });
}

async function getWishlistItems(req, res, next) {
  try {
    const productIds = await getWishlist(req.user.id);
    const products = (await Promise.all(productIds.map((id) => findProductById(id)))).filter(Boolean);
    return res.json({ success: true, data: { products } });
  } catch (error) { return next(error); }
}

async function addWishlistItem(req, res, next) {
  try {
    const product = await findProductById(req.body?.productId);
    if (!product) return res.status(404).json({ success: false, error: { message: 'Product not found.' } });
    const productIds = await addToWishlist(req.user.id, product.id);
    return res.status(200).json({ success: true, data: { productIds } });
  } catch (error) { return next(error); }
}

async function deleteWishlistItem(req, res) {
  const productIds = await removeFromWishlist(req.user.id, req.params.productId);
  return res.json({ success: true, data: { productIds } });
}

async function submitReview(req, res, next) {
  try {
    const product = await findProductById(req.params.productId);
    if (!product) return res.status(404).json({ success: false, error: { message: 'Product not found.' } });
    const review = await createReview({
      userId: req.user.id,
      userName: req.user.name || req.user.email,
      productId: product.id,
      rating: req.body?.rating,
      title: req.body?.title,
      body: req.body?.body,
    });
    return res.status(201).json({ success: true, data: { review } });
  } catch (error) { return next(error); }
}

async function getProductReviews(req, res, next) {
  try {
    return res.json({ success: true, data: { reviews: await listProductReviews(req.params.productId) } });
  } catch (error) { return next(error); }
}

async function getNotifications(req, res) {
  return res.json({ success: true, data: { notifications: await listCustomerNotifications(req.user.id) } });
}

module.exports = {
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
};
