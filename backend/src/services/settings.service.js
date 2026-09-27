const env = require('../config/env');

const defaultSettings = Object.freeze({
  storeName: 'Sannidhi Collective',
  supportEmail: 'support@sannidhi.com',
  currency: 'INR',
  taxRate: 10,
  flatShipping: 0,
  lowStockThreshold: 4,
});
let memorySettings = { ...defaultSettings };
const StoreSetting = env.databaseUrl && env.nodeEnv !== 'test'
  ? require('../models/store-setting.model')
  : null;

async function getStoreSettings() {
  if (!StoreSetting) return { ...memorySettings };

  const entry = await StoreSetting.findByPk('store');
  if (entry) return { ...defaultSettings, ...entry.value };

  await StoreSetting.create({ key: 'store', value: { ...defaultSettings } });
  return { ...defaultSettings };
}

async function saveStoreSettings(settings) {
  memorySettings = { ...defaultSettings, ...settings };
  if (StoreSetting) {
    await StoreSetting.upsert({ key: 'store', value: { ...memorySettings } });
  }
  return { ...memorySettings };
}

module.exports = { defaultSettings, getStoreSettings, saveStoreSettings };
