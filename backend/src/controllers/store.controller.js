const { getStoreSettings } = require('../services/settings.service');

async function getPublicStoreSettings(_req, res, next) {
  try {
    const { storeName, supportEmail, currency, taxRate, flatShipping } = await getStoreSettings();
    return res.json({ success: true, data: { settings: { storeName, supportEmail, currency, taxRate, flatShipping } } });
  } catch (error) { return next(error); }
}

module.exports = { getPublicStoreSettings };
