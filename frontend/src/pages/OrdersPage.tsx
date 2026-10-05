import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  Alert, Box, Button, CircularProgress, Container, Divider, Stack, Typography,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
type Address = { fullName?: string; addressLine1?: string; city?: string; state?: string; postalCode?: string; country?: string };
type Order = {
  id: string; orderNumber: string; status: string; paymentStatus: string; email: string;
  total: number; currency: string; createdAt: string; items: Array<{ productName: string; quantity: number; unitPrice: number }>;
  shippingAddress?: Address; trackingNumber?: string; carrier?: string; giftMessage?: string;
};
type CustomerNotification = { id: string; orderNumber: string; status: string; trackingNumber?: string | null; carrier?: string | null; createdAt: string };

export function OrdersPage() {
  const { orderId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [order, setOrder] = useState<Order | null>(null);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !user) {
      navigate('/login', { replace: true, state: { from: window.location.pathname } });
      return;
    }
    let active = true;
    fetch(`${API_BASE_URL}/api/v1/checkout/${orderId ? `orders/${encodeURIComponent(orderId)}` : 'orders'}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error?.message || 'Could not load your orders.');
        return result.data;
      })
      .then((data) => {
        if (!active) return;
        if (orderId) setOrder(data.order);
        else setOrders(data.orders);
      })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load your orders.');
      })
      .finally(() => { if (active) setBusy(false); });
    return () => { active = false; };
  }, [navigate, orderId, token, user]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/v1/account/notifications`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json())
      .then((result) => { if (result.success) setNotifications(result.data.notifications); })
      .catch(() => undefined);
  }, [token]);

  return (
    <Box sx={{ minHeight: '75vh', bgcolor: '#FAF8F5', py: { xs: 5, md: 8 } }}>
      <Container maxWidth="md">
        <Typography variant="overline" sx={{ color: '#9a7a3e', letterSpacing: '.2em' }}>Client account</Typography>
        <Typography variant="h2" sx={{ fontFamily: '"Cormorant Garamond", Georgia, serif', color: '#1C1917', mb: 3 }}>
          {orderId ? 'Order details' : 'Your orders'}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {notifications.filter((notification) => !orderId || notification.orderNumber === order?.orderNumber).slice(0, 3).map((notification) => (
          <Alert key={notification.id} severity="info" sx={{ mb: 1 }}>
            {notification.orderNumber}: {humanize(notification.status)}{notification.trackingNumber ? ` · ${notification.carrier ? `${notification.carrier} ` : ''}${notification.trackingNumber}` : ''}
          </Alert>
        ))}
        {busy ? <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 240 }}><CircularProgress /></Box> : orderId ? (
          order && <OrderDetail order={order} />
        ) : orders.length ? (
          <Stack divider={<Divider flexItem />}>
            {orders.map((entry) => (
              <Stack key={entry.id} direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ py: 2.5, justifyContent: 'space-between', alignItems: { sm: 'center' } }}>
                <Box>
                  <Typography sx={{ fontWeight: 700 }}>{entry.orderNumber}</Typography>
                  <Typography variant="body2" color="text.secondary">{new Date(entry.createdAt).toLocaleDateString()} · {entry.items?.length || 0} items</Typography>
                </Box>
                <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
                  <Box sx={{ textAlign: { sm: 'right' } }}>
                    <Typography sx={{ fontWeight: 700 }}>{entry.currency} {Number(entry.total).toFixed(2)}</Typography>
                    <Typography variant="caption" color="text.secondary">{humanize(entry.status)}</Typography>
                  </Box>
                  <Button component={Link} to={`/account/orders/${encodeURIComponent(entry.id)}`} variant="outlined">View</Button>
                </Stack>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Box sx={{ py: 6, borderTop: '1px solid rgba(184,151,88,.25)' }}>
            <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>No orders yet</Typography>
            <Button component={Link} to="/catalog" sx={{ mt: 1 }}>Explore the catalog</Button>
          </Box>
        )}
      </Container>
    </Box>
  );
}

function OrderDetail({ order }: { order: Order }) {
  const address = order.shippingAddress || {};
  return (
    <Box sx={{ borderTop: '1px solid rgba(184,151,88,.3)', py: 3 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>{order.orderNumber}</Typography>
          <Typography variant="body2" color="text.secondary">Placed {new Date(order.createdAt).toLocaleString()}</Typography>
        </Box>
        <Typography sx={{ fontWeight: 700 }}>{humanize(order.status)} · {humanize(order.paymentStatus)}</Typography>
      </Stack>
      <Stack divider={<Divider flexItem />}>
        {(order.items || []).map((item, index) => (
          <Stack key={`${item.productName}-${index}`} direction="row" sx={{ justifyContent: 'space-between', py: 1.5 }}>
            <Typography>{item.productName} × {item.quantity}</Typography>
            <Typography>{order.currency} {(item.unitPrice * item.quantity).toFixed(2)}</Typography>
          </Stack>
        ))}
      </Stack>
      <Stack direction="row" sx={{ justifyContent: 'space-between', py: 2, fontWeight: 700 }}>
        <Typography sx={{ fontWeight: 700 }}>Total</Typography>
        <Typography sx={{ fontWeight: 700 }}>{order.currency} {Number(order.total).toFixed(2)}</Typography>
      </Stack>
      <Divider sx={{ my: 2 }} />
      <Typography sx={{ fontWeight: 700, mb: .5 }}>Delivery</Typography>
      <Typography variant="body2">{address.fullName}</Typography>
      <Typography variant="body2" color="text.secondary">{[address.addressLine1, address.city, address.state, address.postalCode, address.country].filter(Boolean).join(', ')}</Typography>
      {order.trackingNumber && <Alert severity="info" sx={{ mt: 2 }}>Tracking: {order.carrier ? `${order.carrier} · ` : ''}{order.trackingNumber}</Alert>}
      {order.giftMessage && <><Typography sx={{ fontWeight: 700, mt: 3, mb: .5 }}>Gift message</Typography><Typography variant="body2">{order.giftMessage}</Typography></>}
      <Button component={Link} to="/account/orders" sx={{ mt: 3 }}>Back to orders</Button>
    </Box>
  );
}

function humanize(value?: string) {
  return (value || 'unknown').replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}
