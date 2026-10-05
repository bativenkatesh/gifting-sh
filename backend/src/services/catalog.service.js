const catalogProducts = [
  {
    id: 'box-1',
    name: 'The Royal Botanical',
    slug: 'the-royal-botanical',
    tagline: 'Organic Lavender • Tuscan Bergamot • Woven Linen',
    description: 'An immaculate sensory refuge assembled inside a hand-pressed cream linen presentation box.',
    price: 185,
    category: 'Heirloom Boxes',
    occasion: 'Solace & Sanctuary',
    image: '/botanical_box.jpg',
    status: 'active',
    stockQuantity: 18,
    lowStockThreshold: 4,
    sku: 'RB-1001',
    weight: 0.9,
    provenance: 'Artisanal ateliers of Provence & Florence',
    contents: ['Wild Lavender & Bergamot Mist', 'Organic Beeswax Tapers', 'Florentine Olive Soap'],
    dimensions: '32cm x 24cm x 12cm',
    badge: 'Curator’s Choice',
  },
  {
    id: 'box-2',
    name: 'The English High Tea Ritual',
    slug: 'the-english-high-tea-ritual',
    tagline: 'Single-Estate Darjeeling • Ribbed Ceramics • Scottish Shortbread',
    description: 'A tribute to centuries of ceremonial hospitality with rare first-flush tea and artisanal confections.',
    price: 220,
    category: 'Heirloom Boxes',
    occasion: 'Milestone Celebrations',
    image: '/tea_box.jpg',
    status: 'active',
    stockQuantity: 11,
    lowStockThreshold: 3,
    sku: 'EHT-2002',
    weight: 1.1,
    provenance: 'Makaibari Estate & Cotswolds Ceramics',
    contents: ['Imperial Tea', 'Hand-thrown cups', 'Shortbread tin'],
    dimensions: '34cm x 26cm x 14cm',
    badge: 'Heirloom Edition',
  },
  {
    id: 'box-3',
    name: 'Santal & Silk Sanctuary',
    slug: 'santal-silk-sanctuary',
    tagline: 'Mysore Sandalwood • Mulberry Silk • Dead Sea Salts',
    description: 'Designed for quiet hours of restoration with pure sandalwood, silk, and mineral baths.',
    price: 265,
    category: 'Heirloom Boxes',
    occasion: 'Weddings & Betrothals',
    image: '/spa_box.jpg',
    status: 'active',
    stockQuantity: 9,
    lowStockThreshold: 2,
    sku: 'SS-3003',
    weight: 1.4,
    provenance: 'Como Silk Weavers & Rajasthan Fragrance Houses',
    contents: ['Silk eye mask', 'Bath elixir', 'Dead Sea salt soak'],
    dimensions: '36cm x 28cm x 15cm',
    badge: 'Signature Reserve',
  },
  {
    id: 'box-4',
    name: 'The Amber & Cognac Reserve',
    slug: 'the-amber-cognac-reserve',
    tagline: 'Smoked Vanilla • Italian Full-Grain Leather • Crystal Tumblers',
    description: 'An uncompromising curation for the study or library with leather and crystal objects.',
    price: 310,
    category: 'Heirloom Boxes',
    occasion: 'Executive Gratitude',
    image: '/hero_gifting.jpg',
    status: 'active',
    stockQuantity: 6,
    lowStockThreshold: 2,
    sku: 'AC-4004',
    weight: 1.8,
    provenance: 'Venetian Glassblowers & Tuscany Tanneries',
    contents: ['Crystal tumblers', 'Leather journal', 'Dark chocolate'],
    dimensions: '38cm x 30cm x 16cm',
    badge: 'Private Vault',
  },
  {
    id: 'item-1',
    name: 'Florentine Deckle-Edge Journal',
    slug: 'florentine-deckle-edge-journal',
    tagline: 'Italian Full-Grain Calfskin • 240 Handmade Cotton Rag Pages',
    description: 'Hand-bound in Florence using vegetable-tanned leather that ages with an extraordinary patina.',
    price: 85,
    category: 'Bar & Leather',
    occasion: 'Executive Gratitude',
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    stockQuantity: 25,
    lowStockThreshold: 5,
    sku: 'FDJ-5005',
    weight: 0.4,
    provenance: 'Florence, Italy',
    contents: ['Hand-bound leather journal'],
    dimensions: 'A5',
  },
  {
    id: 'item-2',
    name: 'Hand-Carved Alabaster Candle',
    slug: 'hand-carved-alabaster-candle',
    tagline: 'Rare Volterra Alabaster • Fig Leaf & Cedar • 70-Hour Burn',
    description: 'Each vessel is lathed from a single piece of translucent Tuscan alabaster.',
    price: 110,
    category: 'Scent & Sanctuary',
    occasion: 'Solace & Sanctuary',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80',
    status: 'active',
    stockQuantity: 16,
    lowStockThreshold: 4,
    sku: 'HCA-6006',
    weight: 0.7,
    provenance: 'Volterra, Italy',
    contents: ['Alabaster vessel candle'],
    dimensions: '12cm',
    badge: 'Hand-Carved',
  },
];
const { databaseEnabled, getRecord, listRecords, saveRecord } = require('./commerce-record.service');
const { createHash } = require('node:crypto');

const customBoxOptions = {
  'linen-cream': { name: 'Signature Ivory Linen Box', price: 25, image: '/empty_box.jpg', material: 'Belgian Linen & Rigid Bookbinder Board' },
  'obsidian-black': { name: 'Lacquered Obsidian Keepsake Box', price: 45, image: '/hero_gifting.jpg', material: 'Hand-Polished Black Piano Lacquer & Brass Hinges' },
  'forest-velvet': { name: 'Vintage Forest Velvet Chest', price: 40, image: '/spa_box.jpg', material: 'Plush Emerald Velvet & Gilded Clasp' },
};
const customBoxAddons = {
  'b-1': { name: 'Lavender & Herb Smudge Bundle', price: 18 },
  'b-2': { name: 'Raw Wildflower Honey & Dipper', price: 24 },
  'b-3': { name: 'French Salted Caramel Shortbread', price: 22 },
  'b-4': { name: 'Organic Cold-Pressed Olive Soap', price: 16 },
  'b-5': { name: 'Solid Brass Tea Strainer', price: 34 },
  'b-6': { name: 'Mulberry Silk Sleep Mask', price: 42 },
};

function normalizeProduct(product) {
  return {
    ...product,
    stockQuantity: product.stockQuantity ?? 0,
    lowStockThreshold: product.lowStockThreshold ?? 0,
    status: product.status || 'active',
  };
}

function createCustomBoxProduct({ boxId, addonIds = [] } = {}) {
  const box = customBoxOptions[boxId];
  if (!Array.isArray(addonIds)) {
    const error = new Error('Choose a valid box and valid bespoke additions.');
    error.statusCode = 400;
    throw error;
  }
  const normalizedAddonIds = [...new Set(addonIds)];
  if (!box || normalizedAddonIds.some((id) => !customBoxAddons[id])) {
    const error = new Error('Choose a valid box and valid bespoke additions.');
    error.statusCode = 400;
    throw error;
  }
  const addons = normalizedAddonIds.map((id) => customBoxAddons[id]);
  const configuration = JSON.stringify({ boxId, addonIds: normalizedAddonIds.sort() });
  const id = `custom-box-${createHash('sha256').update(configuration).digest('hex').slice(0, 16)}`;
  return {
    id,
    name: `Bespoke ${box.name}`,
    slug: id,
    tagline: `${addons.length} curated additions with hand-tied ribbon and wax seal`,
    description: `Bespoke parcel crafted in ${box.material}.`,
    price: box.price + addons.reduce((sum, addon) => sum + addon.price, 0),
    category: 'Heirloom Boxes',
    occasion: 'Milestone Celebrations',
    image: box.image,
    status: 'active',
    stockQuantity: 0,
    lowStockThreshold: 0,
    sku: id.toUpperCase(),
    provenance: 'Hand-assembled to order',
    contents: addons.map((addon) => addon.name),
    isCustomBox: true,
  };
}

async function getCatalogProducts() {
  let products = databaseEnabled ? await listRecords('product') : catalogProducts;
  if (databaseEnabled && products.length === 0) {
    for (const product of catalogProducts) await saveRecord('product', product.id, product);
    products = [...catalogProducts];
  }
  return products.filter((product) => product.status !== 'archived').map(normalizeProduct);
}

async function findProductById(productId) {
  const product = databaseEnabled
    ? await getRecord('product', productId)
    : catalogProducts.find((entry) => entry.id === productId);
  return product && product.status !== 'archived' ? normalizeProduct(product) : null;
}

async function saveProduct(productData, productId) {
  const existingProduct = productId ? await findProductById(productId) : null;
  if (productId && !existingProduct) return null;

  const name = typeof productData.name === 'string' ? productData.name.trim() : '';
  const price = Number(productData.price);
  const stockQuantity = Number(productData.stockQuantity);
  const image = typeof productData.image === 'string' ? productData.image.trim() : '';
  if (!name || !Number.isFinite(price) || price < 0 || !Number.isInteger(stockQuantity) || stockQuantity < 0) {
    const error = new Error('Name, a non-negative price, and a non-negative whole-number stock quantity are required.');
    error.statusCode = 400;
    throw error;
  }
  if (image.length > 4 * 1024 * 1024 || (image.startsWith('data:') && !/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(image))) {
    const error = new Error('Product images must be a supported image file no larger than 2 MB.');
    error.statusCode = 400;
    throw error;
  }

  const slug = (productData.slug || name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  const candidate = {
    ...(existingProduct || {}),
    ...productData,
    id: existingProduct?.id || productData.id || `product-${Date.now()}`,
    name,
    slug,
    price,
    stockQuantity,
    lowStockThreshold: Number.isInteger(Number(productData.lowStockThreshold))
      ? Math.max(0, Number(productData.lowStockThreshold))
      : existingProduct?.lowStockThreshold ?? 0,
    category: String(productData.category || existingProduct?.category || 'Uncategorized').trim(),
    status: productData.status === 'archived' ? 'archived' : 'active',
    sku: String(productData.sku || existingProduct?.sku || `SKU-${Date.now()}`).trim(),
    updatedAt: new Date().toISOString(),
  };

  if (existingProduct) {
    const updatedProduct = { ...existingProduct, ...candidate };
    if (databaseEnabled) await saveRecord('product', updatedProduct.id, updatedProduct);
    else Object.assign(existingProduct, updatedProduct);
    return normalizeProduct(updatedProduct);
  }

  candidate.createdAt = new Date().toISOString();
  if (databaseEnabled) await saveRecord('product', candidate.id, candidate);
  else catalogProducts.push(candidate);
  return normalizeProduct(candidate);
}

async function archiveProduct(productId) {
  const product = await findProductById(productId);
  if (!product) return null;
  product.status = 'archived';
  product.updatedAt = new Date().toISOString();
  if (databaseEnabled) await saveRecord('product', product.id, product);
  else Object.assign(catalogProducts.find((entry) => entry.id === productId), product);
  return normalizeProduct(product);
}

async function reserveProductStock(items) {
  const quantities = new Map();
  for (const item of items) {
    if (String(item.productId).startsWith('custom-box-')) continue;
    if (String(item.productId).startsWith('custom-box-')) continue;
    quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
  }

  if (databaseEnabled) {
    const { sequelize } = require('../database');
    const { CommerceRecord } = require('./commerce-record.service');
    return sequelize.transaction(async (transaction) => {
      const reservations = [];
      for (const [productId, quantity] of quantities) {
        const record = await CommerceRecord.findByPk(`product:${productId}`, {
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        const product = record?.value;
        if (!product || product.status === 'archived' || product.stockQuantity < quantity) {
          const error = new Error(`Insufficient stock for ${product?.name || productId}.`);
          error.statusCode = 400;
          throw error;
        }
        reservations.push({ product, quantity });
      }
      for (const { product, quantity } of reservations) {
        product.stockQuantity -= quantity;
        product.updatedAt = new Date().toISOString();
        await saveRecord('product', product.id, product, transaction);
      }
    });
  }

  const reservations = [];
  for (const [productId, quantity] of quantities) {
    const product = catalogProducts.find((entry) => entry.id === productId && entry.status !== 'archived');
    if (!product || product.stockQuantity < quantity) {
      const error = new Error(`Insufficient stock for ${product?.name || productId}.`);
      error.statusCode = 400;
      throw error;
    }
    reservations.push({ product, quantity });
  }

  for (const { product, quantity } of reservations) {
    product.stockQuantity -= quantity;
    product.updatedAt = new Date().toISOString();
  }
}

async function restoreProductStock(items) {
  const quantities = new Map();
  for (const item of items) quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
  if (databaseEnabled) {
    const { sequelize } = require('../database');
    const { CommerceRecord } = require('./commerce-record.service');
    return sequelize.transaction(async (transaction) => {
      for (const [productId, quantity] of quantities) {
        const record = await CommerceRecord.findByPk(`product:${productId}`, { transaction, lock: transaction.LOCK.UPDATE });
        if (!record) continue;
        const product = record.value;
        product.stockQuantity += quantity;
        product.updatedAt = new Date().toISOString();
        await saveRecord('product', product.id, product, transaction);
      }
    });
  }
  for (const [productId, quantity] of quantities) {
    const product = catalogProducts.find((entry) => entry.id === productId);
    if (product) product.stockQuantity += quantity;
  }
}

module.exports = { catalogProducts, getCatalogProducts, findProductById, createCustomBoxProduct, saveProduct, archiveProduct, reserveProductStock, restoreProductStock };
