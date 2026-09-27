const env = require('../config/env');
const { users, orders, updateCustomerActiveStatus } = require('../data/inMemoryStore');
const { catalogProducts, getCatalogProducts, saveProduct, archiveProduct } = require('../services/catalog.service');
const { getStoreSettings, saveStoreSettings } = require('../services/settings.service');

const User = env.databaseUrl && env.nodeEnv !== 'test' ? require('../models/user.model') : null;

async function getAdminSummary(_req, res, next) {
  try {
    const customerCount = User ? await User.count({ where: { role: 'user' } }) : users.filter((user) => user.role === 'user').length;
    const activeProducts = catalogProducts.filter((product) => product.status !== 'archived');
  return res.status(200).json({
    success: true,
    data: {
      stats: {
        users: customerCount,
        orders: orders.length,
        revenue: orders.reduce((sum, order) => sum + Number(order.total || 0), 0),
        pendingOrders: orders.filter((order) => order.status === 'pending_payment').length,
        products: activeProducts.length,
        lowStockProducts: activeProducts.filter((product) => product.stockQuantity <= product.lowStockThreshold).length,
      },
      recentOrders: orders.slice(-5).reverse(),
    },
  });
  } catch (error) {
    return next(error);
  }
}

function listAdminProducts(_req, res) {
  const products = getCatalogProducts();
  return res.status(200).json({ success: true, data: { products, total: products.length } });
}

function createAdminProduct(req, res, next) {
  try {
    const product = saveProduct(req.body || {});
    return res.status(201).json({ success: true, data: { product } });
  } catch (error) {
    return next(error);
  }
}

function updateAdminProduct(req, res, next) {
  try {
    const product = saveProduct(req.body || {}, req.params.productId);
    if (!product) return res.status(404).json({ success: false, error: { message: 'Product not found.' } });
    return res.status(200).json({ success: true, data: { product } });
  } catch (error) {
    return next(error);
  }
}

function archiveAdminProduct(req, res) {
  const product = archiveProduct(req.params.productId);
  if (!product) return res.status(404).json({ success: false, error: { message: 'Product not found.' } });
  return res.status(200).json({ success: true, data: { product } });
}

async function listAdminCustomers(_req, res, next) {
  try {
    const customers = User
      ? await User.findAll({ where: { role: 'user' }, attributes: ['id', 'name', 'email', 'role', 'isVerified', 'isActive', 'createdAt'], order: [['createdAt', 'DESC']] })
      : users.filter((user) => user.role === 'user').map(({ passwordHash, ...user }) => user).reverse();
    return res.status(200).json({ success: true, data: { customers } });
  } catch (error) {
    return next(error);
  }
}

async function updateAdminCustomer(req, res, next) {
  try {
    const isActive = req.body?.isActive;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, error: { message: 'isActive must be a boolean.' } });
    }

    const customer = User
      ? await User.findOne({ where: { id: req.params.customerId, role: 'user' } })
      : updateCustomerActiveStatus(req.params.customerId, isActive);
    if (!customer) return res.status(404).json({ success: false, error: { message: 'Customer not found.' } });
    if (User) {
      customer.isActive = isActive;
      await customer.save();
    }
    const safeCustomer = customer.get ? customer.get({ plain: true }) : customer;
    delete safeCustomer.passwordHash;
    return res.status(200).json({ success: true, data: { customer: safeCustomer } });
  } catch (error) {
    return next(error);
  }
}

async function getAdminSettings(_req, res, next) {
  try {
    const settings = await getStoreSettings();
    return res.status(200).json({ success: true, data: { settings } });
  } catch (error) {
    return next(error);
  }
}

async function updateAdminSettings(req, res, next) {
  try {
    const body = req.body || {};
    const taxRate = Number(body.taxRate);
    const flatShipping = Number(body.flatShipping);
    const lowStockThreshold = Number(body.lowStockThreshold);
    if (!String(body.storeName || '').trim() || !/^\S+@\S+\.\S+$/.test(String(body.supportEmail || '').trim()) ||
        !Number.isFinite(taxRate) || taxRate < 0 || taxRate > 100 ||
        !Number.isFinite(flatShipping) || flatShipping < 0 ||
        !Number.isInteger(lowStockThreshold) || lowStockThreshold < 0 ||
        !['INR', 'USD', 'GBP', 'EUR'].includes(String(body.currency || '').toUpperCase())) {
      return res.status(400).json({ success: false, error: { message: 'Enter a store name, valid support email, supported currency, tax rate, shipping amount, and whole-number stock threshold.' } });
    }

    const settings = await saveStoreSettings({
      storeName: String(body.storeName).trim(),
      supportEmail: String(body.supportEmail).trim(),
      currency: String(body.currency).trim().toUpperCase(),
      taxRate,
      flatShipping,
      lowStockThreshold,
    });
    return res.status(200).json({ success: true, data: { settings } });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getAdminSummary,
  listAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  archiveAdminProduct,
  listAdminCustomers,
  updateAdminCustomer,
  getAdminSettings,
  updateAdminSettings,
};
