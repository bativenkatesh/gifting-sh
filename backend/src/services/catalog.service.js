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

function normalizeProduct(product) {
  return {
    ...product,
    stockQuantity: product.stockQuantity ?? 0,
    lowStockThreshold: product.lowStockThreshold ?? 0,
    status: product.status || 'active',
  };
}

function getCatalogProducts() {
  return catalogProducts.filter((product) => product.status !== 'archived').map(normalizeProduct);
}

function findProductById(productId) {
  const product = catalogProducts.find((entry) => entry.id === productId);
  return product && product.status !== 'archived' ? normalizeProduct(product) : null;
}

function saveProduct(productData, productId) {
  const existingProduct = productId
    ? catalogProducts.find((entry) => entry.id === productId)
    : null;
  if (productId && !existingProduct) return null;

  const name = typeof productData.name === 'string' ? productData.name.trim() : '';
  const price = Number(productData.price);
  const stockQuantity = Number(productData.stockQuantity);
  if (!name || !Number.isFinite(price) || price < 0 || !Number.isInteger(stockQuantity) || stockQuantity < 0) {
    const error = new Error('Name, a non-negative price, and a non-negative whole-number stock quantity are required.');
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
    Object.assign(existingProduct, candidate);
    return normalizeProduct(existingProduct);
  }

  candidate.createdAt = new Date().toISOString();
  catalogProducts.push(candidate);
  return normalizeProduct(candidate);
}

function archiveProduct(productId) {
  const product = catalogProducts.find((entry) => entry.id === productId);
  if (!product) return null;
  product.status = 'archived';
  product.updatedAt = new Date().toISOString();
  return normalizeProduct(product);
}

function reserveProductStock(items) {
  const quantities = new Map();
  for (const item of items) {
    quantities.set(item.productId, (quantities.get(item.productId) || 0) + item.quantity);
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

module.exports = { catalogProducts, getCatalogProducts, findProductById, saveProduct, archiveProduct, reserveProductStock };
