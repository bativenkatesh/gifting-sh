const { getRecord, listRecords, saveRecord, deleteRecord } = require('./commerce-record.service');

async function subscribeToNewsletter(email) {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    const error = new Error('Enter a valid email address.');
    error.statusCode = 400;
    throw error;
  }
  const record = { email: normalizedEmail, subscribedAt: new Date().toISOString(), active: true };
  await saveRecord('newsletter', normalizedEmail, record);
  return record;
}

async function getCustomerAddresses(userId) {
  return (await getRecord('addresses', userId)) || [];
}

async function saveCustomerAddress(userId, address) {
  const addresses = await getCustomerAddresses(userId);
  const normalized = {
    id: address.id || `address-${Date.now()}`,
    fullName: String(address.fullName || '').trim(),
    addressLine1: String(address.addressLine1 || '').trim(),
    city: String(address.city || '').trim(),
    state: String(address.state || '').trim(),
    postalCode: String(address.postalCode || '').trim(),
    country: String(address.country || '').trim(),
  };
  if (!normalized.fullName || !normalized.addressLine1 || !normalized.city || !normalized.postalCode || !normalized.country) {
    const error = new Error('Name, address, city, postal code, and country are required.');
    error.statusCode = 400;
    throw error;
  }
  const existingIndex = addresses.findIndex((entry) => entry.id === normalized.id);
  if (existingIndex >= 0) addresses[existingIndex] = normalized;
  else addresses.push(normalized);
  await saveRecord('addresses', userId, addresses);
  return addresses;
}

async function deleteCustomerAddress(userId, addressId) {
  const addresses = await getCustomerAddresses(userId);
  const remaining = addresses.filter((address) => address.id !== addressId);
  await saveRecord('addresses', userId, remaining);
  return remaining;
}

async function getWishlist(userId) {
  const wishlist = (await getRecord('wishlist', userId)) || { productIds: [] };
  return wishlist.productIds;
}

async function addToWishlist(userId, productId) {
  const productIds = await getWishlist(userId);
  if (!productIds.includes(productId)) productIds.push(productId);
  await saveRecord('wishlist', userId, { productIds, updatedAt: new Date().toISOString() });
  return productIds;
}

async function removeFromWishlist(userId, productId) {
  const productIds = (await getWishlist(userId)).filter((entry) => entry !== productId);
  await saveRecord('wishlist', userId, { productIds, updatedAt: new Date().toISOString() });
  return productIds;
}

async function createReview({ userId, userName, productId, rating, title, body }) {
  const normalizedRating = Number(rating);
  const normalizedTitle = String(title || '').trim();
  const normalizedBody = String(body || '').trim();
  if (!Number.isInteger(normalizedRating) || normalizedRating < 1 || normalizedRating > 5 || !normalizedTitle || !normalizedBody) {
    const error = new Error('A title, comment, and rating from 1 to 5 are required.');
    error.statusCode = 400;
    throw error;
  }
  const review = {
    id: `${productId}:${userId}`,
    productId,
    userId,
    userName,
    rating: normalizedRating,
    title: normalizedTitle,
    body: normalizedBody,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  await saveRecord('review', review.id, review);
  return review;
}

async function listProductReviews(productId, includePending = false) {
  return (await listRecords('review'))
    .filter((review) => review.productId === productId && (includePending || review.status === 'approved'));
}

async function listPendingReviews() {
  return (await listRecords('review')).filter((review) => review.status === 'pending');
}

async function moderateReview(reviewId, status) {
  if (!['approved', 'rejected'].includes(status)) {
    const error = new Error('Review status must be approved or rejected.');
    error.statusCode = 400;
    throw error;
  }
  const review = await getRecord('review', reviewId);
  if (!review) return null;
  review.status = status;
  review.moderatedAt = new Date().toISOString();
  await saveRecord('review', reviewId, review);
  return review;
}

async function saveCoupon(couponData) {
  const code = String(couponData.code || '').trim().toUpperCase();
  const discountType = couponData.discountType;
  const discountValue = Number(couponData.discountValue);
  if (!/^[A-Z0-9_-]{3,32}$/.test(code) || !['percent', 'fixed'].includes(discountType) ||
      !Number.isFinite(discountValue) || discountValue <= 0 || (discountType === 'percent' && discountValue > 100)) {
    const error = new Error('Provide a valid code and positive fixed or percentage discount.');
    error.statusCode = 400;
    throw error;
  }
  const coupon = {
    code,
    discountType,
    discountValue,
    active: couponData.active !== false,
    expiresAt: couponData.expiresAt || null,
    updatedAt: new Date().toISOString(),
  };
  await saveRecord('coupon', code, coupon);
  return coupon;
}

async function listCoupons() {
  return listRecords('coupon');
}

async function deleteCoupon(code) {
  await deleteRecord('coupon', String(code || '').trim().toUpperCase());
}

async function calculateCouponDiscount(code, subtotal) {
  if (!code) return { discountAmount: 0, coupon: null };
  const coupon = await getRecord('coupon', String(code).trim().toUpperCase());
  if (!coupon || !coupon.active || (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())) {
    const error = new Error('This coupon is invalid or expired.');
    error.statusCode = 400;
    throw error;
  }
  const discountAmount = coupon.discountType === 'percent'
    ? subtotal * coupon.discountValue / 100
    : Math.min(subtotal, coupon.discountValue);
  return { coupon, discountAmount: Number(discountAmount.toFixed(2)) };
}

module.exports = {
  subscribeToNewsletter,
  getCustomerAddresses,
  saveCustomerAddress,
  deleteCustomerAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  createReview,
  listProductReviews,
  listPendingReviews,
  moderateReview,
  saveCoupon,
  listCoupons,
  deleteCoupon,
  calculateCouponDiscount,
};
