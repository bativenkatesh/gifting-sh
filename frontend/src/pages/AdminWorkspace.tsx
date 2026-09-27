import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Alert, Box, Button, Card, CardContent, Chip, CircularProgress, Container, Dialog,
  DialogActions, DialogContent, DialogTitle, Divider, FormControl, InputLabel, MenuItem,
  Select, Stack, Tab, Tabs, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Typography,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const sections = ['Overview', 'Orders', 'Products', 'Inventory', 'Customers', 'Settings'] as const;
type Section = typeof sections[number];
type Product = {
  id: string; name: string; slug?: string; sku?: string; category?: string; tagline?: string;
  description?: string; price: number; stockQuantity: number; lowStockThreshold: number;
  image?: string; status: 'active' | 'archived';
};
type Order = {
  id: string; orderNumber: string; email: string; status: string; total: number; currency: string;
  createdAt?: string; shippingAddress?: { fullName?: string; city?: string; country?: string };
  items?: Array<{ productName: string; quantity: number; unitPrice: number }>;
};
type Customer = { id: string; name: string; email: string; isVerified?: boolean; isActive?: boolean; createdAt?: string };
type Settings = {
  storeName: string; supportEmail: string; currency: string; taxRate: number;
  flatShipping: number; lowStockThreshold: number;
};
type Summary = { stats: { users: number; orders: number; revenue: number; pendingOrders: number; products: number; lowStockProducts: number }; recentOrders: Order[] };
type ProductForm = Omit<Product, 'id' | 'status'> & { id?: string; status: 'active' | 'archived' };

const emptyProduct: ProductForm = {
  name: '', sku: '', category: '', tagline: '', description: '', price: 0,
  stockQuantity: 0, lowStockThreshold: 4, image: '', status: 'active',
};
const emptySettings: Settings = {
  storeName: '', supportEmail: '', currency: 'INR', taxRate: 10, flatShipping: 0, lowStockThreshold: 4,
};
const orderStatuses = ['pending_payment', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export function AdminWorkspace() {
  const { token, user, logout } = useAuth();
  const [section, setSection] = useState<Section>('Overview');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [settings, setSettings] = useState<Settings>(emptySettings);
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [productDialog, setProductDialog] = useState(false);
  const [productForm, setProductForm] = useState<ProductForm>(emptyProduct);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const api = useCallback(async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    const result = await response.json();
    if (!response.ok || !result.success) {
      throw new Error(result.error?.message || 'The request could not be completed.');
    }
    return result.data as T;
  }, [token]);

  const refreshData = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      const [summaryData, orderData, productData, customerData, settingsData] = await Promise.all([
        api<{ stats: Summary['stats']; recentOrders: Order[] }>('/summary'),
        api<{ orders: Order[] }>('/orders'),
        api<{ products: Product[] }>('/products'),
        api<{ customers: Customer[] }>('/customers'),
        api<{ settings: Settings }>('/settings'),
      ]);
      setSummary(summaryData);
      setOrders(orderData.orders);
      setProducts(productData.products);
      setCustomers(customerData.customers);
      setSettings(settingsData.settings);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not load admin data.');
    } finally {
      setBusy(false);
    }
  }, [api]);

  useEffect(() => { void refreshData(); }, [refreshData]);

  const filteredProducts = useMemo(() => products.filter((product) =>
    `${product.name} ${product.sku || ''} ${product.category || ''}`.toLowerCase().includes(search.toLowerCase())), [products, search]);
  const filteredOrders = useMemo(() => orders.filter((order) =>
    `${order.orderNumber} ${order.email} ${order.status}`.toLowerCase().includes(search.toLowerCase())), [orders, search]);
  const filteredCustomers = useMemo(() => customers.filter((customer) =>
    `${customer.name} ${customer.email}`.toLowerCase().includes(search.toLowerCase())), [customers, search]);

  async function updateOrderStatus(orderId: string, status: string) {
    setSaving(true); setError(''); setNotice('');
    try {
      const result = await api<{ order: Order }>(`/orders/${encodeURIComponent(orderId)}`, {
        method: 'PATCH', body: JSON.stringify({ status }),
      });
      setOrders((current) => current.map((order) => order.id === orderId ? result.order : order));
      setNotice('Order status updated.');
      await refreshSummary();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update the order.');
    } finally { setSaving(false); }
  }

  async function refreshSummary() {
    try {
      const data = await api<Summary>('/summary');
      setSummary(data);
    } catch { /* Existing page data remains available; full refresh reports API errors. */ }
  }

  function openProduct(product?: Product) {
    setProductForm(product ? { ...product } : { ...emptyProduct, lowStockThreshold: settings.lowStockThreshold });
    setProductDialog(true);
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    const { id, ...body } = productForm;
    try {
      const result = await api<{ product: Product }>(id ? `/products/${encodeURIComponent(id)}` : '/products', {
        method: id ? 'PATCH' : 'POST', body: JSON.stringify(body),
      });
      setProducts((current) => id
        ? current.map((product) => product.id === id ? result.product : product)
        : [result.product, ...current]);
      setProductDialog(false);
      setNotice(id ? 'Product changes saved.' : 'Product created.');
      await refreshSummary();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not save product.');
    } finally { setSaving(false); }
  }

  async function archiveProduct(product: Product) {
    if (!window.confirm(`Archive “${product.name}”? It will no longer appear in the storefront.`)) return;
    setSaving(true); setError(''); setNotice('');
    try {
      await api(`/products/${encodeURIComponent(product.id)}`, { method: 'DELETE' });
      setProducts((current) => current.map((entry) => entry.id === product.id ? { ...entry, status: 'archived' } : entry));
      setNotice('Product archived.');
      await refreshSummary();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not archive product.');
    } finally { setSaving(false); }
  }

  async function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      const result = await api<{ settings: Settings }>('/settings', { method: 'PUT', body: JSON.stringify(settings) });
      setSettings(result.settings);
      setNotice('Store settings saved.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not save settings.');
    } finally { setSaving(false); }
  }

  async function toggleCustomer(customer: Customer) {
    setSaving(true); setError(''); setNotice('');
    try {
      const result = await api<{ customer: Customer }>(`/customers/${encodeURIComponent(customer.id)}`, {
        method: 'PATCH', body: JSON.stringify({ isActive: customer.isActive === false }),
      });
      setCustomers((current) => current.map((entry) => entry.id === customer.id ? result.customer : entry));
      setNotice(result.customer.isActive ? 'Customer account activated.' : 'Customer account deactivated.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update the customer account.');
    } finally { setSaving(false); }
  }

  const lowStockProducts = products.filter((product) => product.status !== 'archived' && product.stockQuantity <= product.lowStockThreshold);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f3ee', color: '#252a22' }}>
      <Box sx={{ bgcolor: '#252a22', color: '#f6f2e9', px: { xs: 2, md: 4 }, py: 2.25 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between', maxWidth: 1500, mx: 'auto' }}>
          <Box>
            <Typography variant="overline" sx={{ letterSpacing: '.22em', color: '#c7ad76', lineHeight: 1 }}>Sannidhi Collective</Typography>
            <Typography sx={{ fontFamily: 'Georgia, serif', fontSize: '1.35rem' }}>Admin workspace</Typography>
          </Box>
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' }, color: 'rgba(246,242,233,.7)' }}>{user?.email}</Typography>
            <Button onClick={logout} sx={{ color: '#f6f2e9', border: '1px solid rgba(246,242,233,.3)', borderRadius: 0 }}>Sign out</Button>
          </Stack>
        </Stack>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
        <Box sx={{ borderBottom: '1px solid #ded8cb', mb: 3 }}>
          <Tabs value={section} onChange={(_event, value: Section) => { setSection(value); setSearch(''); setNotice(''); }} variant="scrollable" scrollButtons="auto">
            {sections.map((item) => <Tab key={item} value={item} label={item} sx={{ textTransform: 'none', minWidth: 90 }} />)}
          </Tabs>
        </Box>

        {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>{error}</Alert>}
        {notice && <Alert severity="success" onClose={() => setNotice('')} sx={{ mb: 2 }}>{notice}</Alert>}
        {busy ? <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 360 }}><CircularProgress /></Box> : (
          <>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ justifyContent: 'space-between', alignItems: { sm: 'center' }, mb: 3 }}>
              <Box>
                <Typography variant="h4" sx={{ fontFamily: 'Georgia, serif' }}>{section}</Typography>
                <Typography color="text.secondary">{sectionDescription(section)}</Typography>
              </Box>
              {['Orders', 'Products', 'Inventory', 'Customers'].includes(section) && (
                <TextField size="small" label="Search" value={search} onChange={(event) => setSearch(event.target.value)} sx={{ minWidth: { sm: 260 }, bgcolor: 'white' }} />
              )}
              {section === 'Products' && <Button variant="contained" onClick={() => openProduct()} sx={primaryButton}>Add product</Button>}
            </Stack>

            {section === 'Overview' && summary && (
              <>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
                  <StatCard title="Gross order value" value={`${settings.currency} ${Number(summary.stats.revenue).toLocaleString('en-IN')}`} />
                  <StatCard title="Orders" value={summary.stats.orders} detail={`${summary.stats.pendingOrders} awaiting action`} />
                  <StatCard title="Products" value={summary.stats.products} detail={`${summary.stats.lowStockProducts} need replenishment`} />
                  <StatCard title="Customers" value={summary.stats.users} />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.5fr 1fr' }, gap: 2 }}>
                  <Card variant="outlined" sx={panelStyle}>
                    <CardContent>
                      <Typography variant="h6" sx={{ fontFamily: 'Georgia, serif', mb: 2 }}>Recent orders</Typography>
                      <OrderTable orders={summary.recentOrders} saving={saving} onStatusChange={updateOrderStatus} onView={setSelectedOrder} compact />
                    </CardContent>
                  </Card>
                  <Card variant="outlined" sx={panelStyle}>
                    <CardContent>
                      <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" sx={{ fontFamily: 'Georgia, serif' }}>Stock alerts</Typography>
                        <Chip size="small" label={lowStockProducts.length} color={lowStockProducts.length ? 'warning' : 'default'} />
                      </Stack>
                      {lowStockProducts.length ? lowStockProducts.slice(0, 6).map((product) => (
                        <Stack key={product.id} direction="row" spacing={1} sx={{ justifyContent: 'space-between', py: 1.2, borderBottom: '1px solid #eee9df' }}>
                          <Typography variant="body2">{product.name}</Typography>
                          <Typography variant="body2" color="warning.dark">{product.stockQuantity} left</Typography>
                        </Stack>
                      )) : <Typography color="text.secondary">All active products are sufficiently stocked.</Typography>}
                    </CardContent>
                  </Card>
                </Box>
              </>
            )}

            {section === 'Orders' && <OrderTable orders={filteredOrders} saving={saving} onStatusChange={updateOrderStatus} onView={setSelectedOrder} />}
            {section === 'Products' && <ProductTable products={filteredProducts} onEdit={openProduct} onArchive={archiveProduct} saving={saving} />}
            {section === 'Inventory' && <InventoryTable products={filteredProducts.filter((product) => product.status !== 'archived')} onEdit={openProduct} threshold={settings.lowStockThreshold} />}
            {section === 'Customers' && <CustomerTable customers={filteredCustomers} saving={saving} onToggle={toggleCustomer} />}
            {section === 'Settings' && (
              <Card variant="outlined" sx={{ ...panelStyle, maxWidth: 850 }}>
                <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                  <Typography variant="h6" sx={{ fontFamily: 'Georgia, serif', mb: .5 }}>Store configuration</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>These settings are saved by the admin API and used for dashboard defaults and operational thresholds.</Typography>
                  <Box component="form" onSubmit={saveSettings} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2.5 }}>
                    <TextField label="Store name" required value={settings.storeName} onChange={(event) => setSettings({ ...settings, storeName: event.target.value })} />
                    <TextField label="Support email" type="email" required value={settings.supportEmail} onChange={(event) => setSettings({ ...settings, supportEmail: event.target.value })} />
                    <FormControl>
                      <InputLabel id="currency-label">Currency</InputLabel>
                      <Select labelId="currency-label" label="Currency" value={settings.currency} onChange={(event: SelectChangeEvent) => setSettings({ ...settings, currency: event.target.value })}>
                        {['INR', 'USD', 'GBP', 'EUR'].map((currency) => <MenuItem key={currency} value={currency}>{currency}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <TextField label="Tax rate (%)" type="number" slotProps={{ htmlInput: { min: 0, max: 100, step: .01 } }} value={settings.taxRate} onChange={(event) => setSettings({ ...settings, taxRate: Number(event.target.value) })} />
                    <TextField label="Flat shipping charge" type="number" slotProps={{ htmlInput: { min: 0, step: .01 } }} value={settings.flatShipping} onChange={(event) => setSettings({ ...settings, flatShipping: Number(event.target.value) })} />
                    <TextField label="Low-stock alert threshold" type="number" slotProps={{ htmlInput: { min: 0, step: 1 } }} value={settings.lowStockThreshold} onChange={(event) => setSettings({ ...settings, lowStockThreshold: Number(event.target.value) })} />
                    <Box sx={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                      <Button type="submit" variant="contained" disabled={saving} sx={primaryButton}>{saving ? 'Saving…' : 'Save settings'}</Button>
                    </Box>
                  </Box>
                  <Divider sx={{ my: 3 }} />
                  <Alert severity="info">Store settings persist in Postgres when DATABASE_URL is configured. The current catalog, inventory, and orders still use server memory and reset when the API process restarts.</Alert>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </Container>

      <Dialog open={productDialog} onClose={() => !saving && setProductDialog(false)} fullWidth maxWidth="md">
        <Box component="form" onSubmit={saveProduct}>
          <DialogTitle sx={{ fontFamily: 'Georgia, serif' }}>{productForm.id ? 'Edit product' : 'Create product'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, pt: 1 }}>
              <TextField label="Product name" required value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} />
              <TextField label="SKU" value={productForm.sku || ''} onChange={(event) => setProductForm({ ...productForm, sku: event.target.value })} />
              <TextField label="Category" required value={productForm.category || ''} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} />
              <TextField label="Price" type="number" required slotProps={{ htmlInput: { min: 0, step: .01 } }} value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: Number(event.target.value) })} />
              <TextField label="Stock quantity" type="number" required slotProps={{ htmlInput: { min: 0, step: 1 } }} value={productForm.stockQuantity} onChange={(event) => setProductForm({ ...productForm, stockQuantity: Number(event.target.value) })} />
              <TextField label="Low-stock threshold" type="number" slotProps={{ htmlInput: { min: 0, step: 1 } }} value={productForm.lowStockThreshold} onChange={(event) => setProductForm({ ...productForm, lowStockThreshold: Number(event.target.value) })} />
              <TextField label="Tagline" value={productForm.tagline || ''} onChange={(event) => setProductForm({ ...productForm, tagline: event.target.value })} />
              <TextField label="Image URL" value={productForm.image || ''} onChange={(event) => setProductForm({ ...productForm, image: event.target.value })} />
              <TextField label="Description" multiline minRows={3} sx={{ gridColumn: '1 / -1' }} value={productForm.description || ''} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={() => setProductDialog(false)} disabled={saving}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving} sx={primaryButton}>{saving ? 'Saving…' : 'Save product'}</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} fullWidth maxWidth="sm">
        {selectedOrder && <>
          <DialogTitle sx={{ fontFamily: 'Georgia, serif' }}>Order {selectedOrder.orderNumber}</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">{selectedOrder.email} · {humanize(selectedOrder.status)}</Typography>
              <Box>
                <Typography sx={{ fontWeight: 600, mb: 1 }}>Items</Typography>
                {(selectedOrder.items || []).map((item, index) => <Stack key={`${item.productName}-${index}`} direction="row" sx={{ justifyContent: 'space-between', py: .75 }}>
                  <Typography variant="body2">{item.productName} × {item.quantity}</Typography>
                  <Typography variant="body2">{selectedOrder.currency} {(item.unitPrice * item.quantity).toLocaleString('en-IN')}</Typography>
                </Stack>)}
                {!selectedOrder.items?.length && <Typography variant="body2" color="text.secondary">No line items are available.</Typography>}
              </Box>
              <Divider />
              <Box>
                <Typography sx={{ fontWeight: 600, mb: .5 }}>Ship to</Typography>
                <Typography variant="body2">{selectedOrder.shippingAddress?.fullName || '—'}</Typography>
                <Typography variant="body2" color="text.secondary">{[selectedOrder.shippingAddress?.city, selectedOrder.shippingAddress?.country].filter(Boolean).join(', ') || 'Address not provided'}</Typography>
              </Box>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography sx={{ fontWeight: 700 }}>Order total</Typography>
                <Typography sx={{ fontWeight: 700 }}>{selectedOrder.currency} {Number(selectedOrder.total).toLocaleString('en-IN')}</Typography>
              </Stack>
            </Stack>
          </DialogContent>
          <DialogActions><Button onClick={() => setSelectedOrder(null)}>Close</Button></DialogActions>
        </>}
      </Dialog>
    </Box>
  );
}

function sectionDescription(section: Section) {
  const descriptions: Record<Section, string> = {
    Overview: 'A live snapshot of store performance and fulfillment.',
    Orders: 'Review customer orders and update fulfillment status.',
    Products: 'Create, update, and archive the storefront catalog.',
    Inventory: 'Monitor stock levels and update quantities or reorder thresholds.',
    Customers: 'Customer account directory from the configured user store.',
    Settings: 'Manage store identity, currency, tax, shipping, and stock alerts.',
  };
  return descriptions[section];
}

function StatCard({ title, value, detail }: { title: string; value: string | number; detail?: string }) {
  return <Card variant="outlined" sx={panelStyle}><CardContent>
    <Typography variant="overline" color="text.secondary">{title}</Typography>
    <Typography variant="h4" sx={{ fontFamily: 'Georgia, serif', mt: .5 }}>{value}</Typography>
    {detail && <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>{detail}</Typography>}
  </CardContent></Card>;
}

function OrderTable({ orders, saving, onStatusChange, onView, compact = false }: {
  orders: Order[]; saving: boolean; onStatusChange: (id: string, status: string) => void;
  onView: (order: Order) => void; compact?: boolean;
}) {
  return <TableContainer sx={{ border: '1px solid #e5dfd2', bgcolor: '#fffdf9' }}><Table size="small">
    <TableHead><TableRow>{['Order', 'Customer', ...(!compact ? ['Date'] : []), 'Total', 'Status', 'Details'].map((label) => <TableCell key={label} sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{label}</TableCell>)}</TableRow></TableHead>
    <TableBody>{orders.length ? orders.map((order) => <TableRow key={order.id} hover>
      <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{order.orderNumber}</Typography></TableCell>
      <TableCell>{order.email}</TableCell>
      {!compact && <TableCell>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</TableCell>}
      <TableCell sx={{ whiteSpace: 'nowrap' }}>{order.currency || 'INR'} {Number(order.total).toLocaleString('en-IN')}</TableCell>
      <TableCell sx={{ minWidth: 175 }}><FormControl size="small" fullWidth>
        <Select value={orderStatuses.includes(order.status) ? order.status : 'pending_payment'} disabled={saving} onChange={(event) => onStatusChange(order.id, event.target.value)}>
          {orderStatuses.map((status) => <MenuItem key={status} value={status}>{humanize(status)}</MenuItem>)}
        </Select>
      </FormControl></TableCell>
      <TableCell><Button size="small" onClick={() => onView(order)}>View</Button></TableCell>
    </TableRow>) : <TableRow><TableCell colSpan={compact ? 5 : 6} align="center" sx={{ py: 5, color: 'text.secondary' }}>No orders found.</TableCell></TableRow>}</TableBody>
  </Table></TableContainer>;
}

function ProductTable({ products, onEdit, onArchive, saving }: {
  products: Product[]; onEdit: (product: Product) => void; onArchive: (product: Product) => void; saving: boolean;
}) {
  return <TableContainer sx={{ border: '1px solid #e5dfd2', bgcolor: '#fffdf9' }}><Table>
    <TableHead><TableRow>{['Product', 'SKU', 'Category', 'Price', 'Stock', 'Visibility', 'Actions'].map((label) => <TableCell key={label} sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{label}</TableCell>)}</TableRow></TableHead>
    <TableBody>{products.length ? products.map((product) => <TableRow key={product.id} hover>
      <TableCell sx={{ minWidth: 210 }}><Typography sx={{ fontWeight: 600 }}>{product.name}</Typography></TableCell>
      <TableCell>{product.sku || '—'}</TableCell><TableCell>{product.category || '—'}</TableCell>
      <TableCell>{Number(product.price).toLocaleString('en-IN')}</TableCell>
      <TableCell><Chip size="small" label={product.stockQuantity} color={product.stockQuantity <= product.lowStockThreshold ? 'warning' : 'default'} /></TableCell>
      <TableCell><Chip size="small" label={humanize(product.status)} color={product.status === 'active' ? 'success' : 'default'} /></TableCell>
      <TableCell sx={{ whiteSpace: 'nowrap' }}><Button size="small" onClick={() => onEdit(product)}>Edit</Button>{product.status !== 'archived' && <Button size="small" color="error" disabled={saving} onClick={() => onArchive(product)}>Archive</Button>}</TableCell>
    </TableRow>) : <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: 'text.secondary' }}>No products match the search.</TableCell></TableRow>}</TableBody>
  </Table></TableContainer>;
}

function InventoryTable({ products, onEdit, threshold }: { products: Product[]; onEdit: (product: Product) => void; threshold: number }) {
  return <TableContainer sx={{ border: '1px solid #e5dfd2', bgcolor: '#fffdf9' }}><Table>
    <TableHead><TableRow>{['Product', 'SKU', 'Available', 'Alert threshold', 'Inventory state', 'Action'].map((label) => <TableCell key={label} sx={{ fontWeight: 700 }}>{label}</TableCell>)}</TableRow></TableHead>
    <TableBody>{products.length ? products.map((product) => {
      const isLow = product.stockQuantity <= (product.lowStockThreshold ?? threshold);
      return <TableRow key={product.id} hover>
        <TableCell>{product.name}</TableCell><TableCell>{product.sku || '—'}</TableCell>
        <TableCell sx={{ fontWeight: 700 }}>{product.stockQuantity}</TableCell><TableCell>{product.lowStockThreshold ?? threshold}</TableCell>
        <TableCell><Chip size="small" color={isLow ? 'warning' : 'success'} label={isLow ? 'Reorder' : 'Healthy'} /></TableCell>
        <TableCell><Button size="small" onClick={() => onEdit(product)}>Adjust stock</Button></TableCell>
      </TableRow>;
    }) : <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}>No products found.</TableCell></TableRow>}</TableBody>
  </Table></TableContainer>;
}

function CustomerTable({ customers, saving, onToggle }: {
  customers: Customer[]; saving: boolean; onToggle: (customer: Customer) => void;
}) {
  return <TableContainer sx={{ border: '1px solid #e5dfd2', bgcolor: '#fffdf9' }}><Table>
    <TableHead><TableRow>{['Customer', 'Email', 'Joined', 'Verification', 'Account', 'Action'].map((label) => <TableCell key={label} sx={{ fontWeight: 700 }}>{label}</TableCell>)}</TableRow></TableHead>
    <TableBody>{customers.length ? customers.map((customer) => <TableRow key={customer.id} hover>
      <TableCell>{customer.name}</TableCell><TableCell>{customer.email}</TableCell>
      <TableCell>{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '—'}</TableCell>
      <TableCell><Chip size="small" label={customer.isVerified ? 'Verified' : 'Unverified'} color={customer.isVerified ? 'success' : 'default'} /></TableCell>
      <TableCell><Chip size="small" label={customer.isActive === false ? 'Disabled' : 'Active'} color={customer.isActive === false ? 'default' : 'success'} /></TableCell>
      <TableCell><Button size="small" disabled={saving} color={customer.isActive === false ? 'success' : 'error'} onClick={() => onToggle(customer)}>{customer.isActive === false ? 'Activate' : 'Deactivate'}</Button></TableCell>
    </TableRow>) : <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5, color: 'text.secondary' }}>No customers found.</TableCell></TableRow>}</TableBody>
  </Table></TableContainer>;
}

function humanize(value: string) { return value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()); }
const panelStyle = { borderRadius: 0, bgcolor: '#fffdf9', borderColor: '#e5dfd2' } as const;
const primaryButton = { borderRadius: 0, bgcolor: '#252a22', '&:hover': { bgcolor: '#41483b' } } as const;
