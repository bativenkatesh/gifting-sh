import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Stack,
  Typography,
  Grid,
  Button,
  IconButton,
  Divider,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Dialog,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add,
  Remove,
  DeleteOutlined,
  CheckCircleOutlined,
  LockOutlined,
} from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { ribbonOptions, waxSealOptions } from '../data/products';
import { useAuth } from '../context/AuthContext';
import { useStoreCurrency } from '../context/StoreSettings';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
type OrderReceipt = { orderNumber: string; total: number; currency: string; status: string };
type SavedAddress = { id: string; fullName: string; addressLine1: string; city: string; state: string; postalCode: string; country: string };
type CheckoutQuote = { subtotal: number; discountAmount: number; shippingAmount: number; taxAmount: number; total: number; currency: string };

function getSessionId() {
  let sessionId = localStorage.getItem('gifting_session_id');
  if (!sessionId) {
    sessionId = `session-${crypto.randomUUID()}`;
    localStorage.setItem('gifting_session_id', sessionId);
  }
  return sessionId;
}

export const CartPage: React.FC = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    total,
    giftOptions,
    updateGiftOptions,
    clearCart,
  } = useCart();
  const { user, token } = useAuth();
  const currency = useStoreCurrency();
  const navigate = useNavigate();

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderReceipt, setOrderReceipt] = useState<OrderReceipt | null>(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [address, setAddress] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    addressLine1: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  });

  const handleCheckout = async () => {
    if (!token) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    setSubmitting(true);
    setCheckoutError('');
    try {
      const sessionId = getSessionId();
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      const send = async (path: string, body: unknown, method = 'POST') => {
        const response = await fetch(`${API_BASE_URL}/api/v1${path}`, { method, headers, body: JSON.stringify(body) });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error?.message || 'Checkout could not be prepared.');
        return result.data;
      };
      await send('/cart/clear', { sessionId }, 'DELETE');
      for (const item of items) {
        await send('/cart/items', {
          sessionId,
          productId: item.productId,
          quantity: item.quantity,
          ...(item.product.isCustomBox ? { customBox: { boxId: item.customizations?.boxOptionId, addonIds: item.customizations?.addonIds || [] } } : {}),
          customizations: {
            ...item.customizations,
            calligraphyNote: giftOptions.calligraphyNote,
            senderName: giftOptions.senderName,
            recipientName: giftOptions.recipientName,
            ribbonColor: giftOptions.ribbonColor,
            waxSeal: giftOptions.waxSeal,
          },
        });
      }
      const response = await fetch(`${API_BASE_URL}/api/v1/account/addresses`, { headers: { Authorization: `Bearer ${token}` } });
      const result = await response.json();
      if (response.ok && result.success) {
        setSavedAddresses(result.data.addresses || []);
        const lastAddress = result.data.addresses?.at(-1);
        if (lastAddress) setAddress((current) => ({ ...lastAddress, email: current.email || user?.email || '' }));
      }
      setCheckoutModalOpen(true);
    } catch (requestError) {
      setCheckoutError(requestError instanceof Error ? requestError.message : 'Checkout could not be prepared.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!checkoutModalOpen || !token || orderComplete) return;
    const params = new URLSearchParams({ sessionId: getSessionId() });
    if (couponCode.trim()) params.set('couponCode', couponCode.trim());
    fetch(`${API_BASE_URL}/api/v1/checkout/quote?${params}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error?.message || 'Could not calculate checkout total.');
        setQuote(result.data.quote);
        setCheckoutError('');
      })
      .catch((requestError) => {
        setQuote(null);
        setCheckoutError(requestError instanceof Error ? requestError.message : 'Could not calculate checkout total.');
      });
  }, [checkoutModalOpen, couponCode, items, orderComplete, token]);

  const handleConfirmOrder = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) {
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    setSubmitting(true);
    setCheckoutError('');
    try {
      const sessionId = getSessionId();
      const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };
      const send = async (path: string, body: unknown, method = 'POST') => {
        const response = await fetch(`${API_BASE_URL}/api/v1${path}`, {
          method, headers, body: JSON.stringify(body),
        });
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error?.message || 'Checkout could not be completed.');
        return result.data;
      };

      const result = await send('/checkout', {
        sessionId,
        email: address.email,
        shippingAddress: address,
        billingAddress: address,
        giftMessage: giftOptions.calligraphyNote,
        couponCode,
      });
      setOrderReceipt(result.order);
      setOrderComplete(true);
      clearCart();
    } catch (requestError) {
      setCheckoutError(requestError instanceof Error ? requestError.message : 'Checkout could not be completed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ backgroundColor: '#FAF8F5', minHeight: '85vh', py: { xs: 5, md: 8 } }}>
      <Container maxWidth="xl">
        {/* Page Title */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="caption"
            sx={{
              fontFamily: '"Cinzel", serif',
              letterSpacing: '0.28em',
              color: '#B89758',
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              display: 'block',
              mb: 1,
            }}
          >
            Review & Gifting Atelier
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: { xs: '2.2rem', md: '3.4rem' },
              color: '#1C1917',
            }}
          >
            Your Curated Parcel
          </Typography>
        </Box>

        {items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Maison Lotus"
              sx={{ width: 84, opacity: 0.35, mb: 2.5, mx: 'auto' }}
            />
            <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", serif', color: '#1C1917' }}>
              Your parcel currently awaits curation
            </Typography>
            <Typography variant="body2" sx={{ color: '#78716C', mt: 1, mb: 3 }}>
              Explore our permanent collection or build a custom gift ensemble.
            </Typography>
            <Button variant="contained" onClick={() => navigate('/catalog')} sx={{ px: 4, py: 1.5 }}>
              Explore The Catalog
            </Button>
          </Box>
        ) : (
          <Grid container spacing={5}>
            {/* Left Col: Order Items (60%) */}
            <Grid size={{ xs: 12, lg: 7 }}>
              <Box sx={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(184, 151, 88, 0.25)', p: { xs: 2.5, md: 4 }, mb: 4 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: '"Cinzel", serif',
                    letterSpacing: '0.15em',
                    color: '#B89758',
                    mb: 2.5,
                  }}
                >
                  Selected Heirlooms ({items.reduce((s, i) => s + i.quantity, 0)})
                </Typography>

                {items.map((item) => (
                  <Box key={item.id}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        py: 3,
                        gap: 2.5,
                      }}
                    >
                      <Box
                        component="img"
                        src={item.product.image}
                        alt={item.product.name}
                        sx={{
                          width: { xs: '100%', sm: 110 },
                          height: { xs: 180, sm: 110 },
                          objectFit: 'cover',
                          border: '1px solid rgba(184, 151, 88, 0.25)',
                          flexShrink: 0,
                        }}
                      />

                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            fontFamily: '"Cinzel", serif',
                            color: '#B89758',
                            fontSize: '0.65rem',
                            letterSpacing: '0.12em',
                            display: 'block',
                          }}
                        >
                          {item.product.category}
                        </Typography>

                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily: '"Cormorant Garamond", serif',
                            fontSize: '1.28rem',
                            fontWeight: 600,
                            lineHeight: 1.2,
                            color: '#1C1917',
                          }}
                        >
                          {item.product.name}
                        </Typography>

                        {item.customizations?.boxStyle && (
                          <Typography variant="caption" sx={{ color: '#78716C', display: 'block', mt: 0.3 }}>
                            Vessel: {item.customizations.boxStyle}
                          </Typography>
                        )}

                        {item.customizations?.itemsIncluded && (
                          <Typography variant="caption" sx={{ color: '#78716C', display: 'block' }}>
                            Includes: {item.customizations.itemsIncluded.join(', ')}
                          </Typography>
                        )}

                        <Typography
                          variant="body2"
                          sx={{
                            color: '#B89758',
                            fontWeight: 600,
                            fontFamily: '"Plus Jakarta Sans", sans-serif',
                            mt: 0.8,
                          }}
                        >
                          {currency} {item.product.price.toFixed(2)} each
                        </Typography>
                      </Box>

                      {/* Quantity and Actions */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(184, 151, 88, 0.3)', px: 0.8 }}>
                          <IconButton size="small" onClick={() => updateQuantity(item.id, -1)}>
                            <Remove sx={{ fontSize: '0.9rem' }} />
                          </IconButton>
                          <Typography sx={{ px: 1.5, fontSize: '0.85rem', fontWeight: 600 }}>
                            {item.quantity}
                          </Typography>
                          <IconButton size="small" onClick={() => updateQuantity(item.id, 1)}>
                            <Add sx={{ fontSize: '0.9rem' }} />
                          </IconButton>
                        </Box>

                        <Typography sx={{ fontWeight: 600, minWidth: 70, textAlign: 'right', fontFamily: '"Plus Jakarta Sans", sans-serif' }}>
                          {currency} {(item.product.price * item.quantity).toFixed(2)}
                        </Typography>

                        <IconButton onClick={() => removeFromCart(item.id)} sx={{ color: '#A8A29E', '&:hover': { color: '#C98A90' } }}>
                          <DeleteOutlined />
                        </IconButton>
                      </Box>
                    </Box>
                    <Divider sx={{ borderColor: 'rgba(184, 151, 88, 0.15)' }} />
                  </Box>
                ))}
              </Box>

              {/* Bespoke Calligraphy Card Customizer */}
              <Box sx={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(184, 151, 88, 0.25)', p: { xs: 2.5, md: 4 } }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: '"Cinzel", serif',
                    letterSpacing: '0.15em',
                    color: '#B89758',
                    mb: 1,
                  }}
                >
                  Hand-Calligraphed Stationery & Wax Seal
                </Typography>
                <Typography variant="body2" sx={{ color: '#78716C', mb: 3 }}>
                  Every gift box is accompanied by a heavy deckle-edge card inscribed by hand with liquid archival ink.
                </Typography>

                <Grid container spacing={2.5} sx={{ mb: 3 }}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Recipient Title & Name"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={giftOptions.recipientName}
                      onChange={(e) => updateGiftOptions({ recipientName: e.target.value })}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      label="Sender Title & Name"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={giftOptions.senderName}
                      onChange={(e) => updateGiftOptions({ senderName: e.target.value })}
                    />
                  </Grid>
                </Grid>

                <TextField
                  label="Calligraphy Card Note"
                  multiline
                  rows={3}
                  fullWidth
                  value={giftOptions.calligraphyNote}
                  onChange={(e) => updateGiftOptions({ calligraphyNote: e.target.value })}
                  sx={{ mb: 3 }}
                />

                {/* Wax Seal & Ribbon Choice */}
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ fontFamily: '"Cinzel", serif', letterSpacing: '0.12em', color: '#78716C', display: 'block', mb: 1 }}>
                      Signature Wax Seal
                    </Typography>
                    <RadioGroup
                      value={giftOptions.waxSeal}
                      onChange={(e) => updateGiftOptions({ waxSeal: e.target.value })}
                    >
                      {waxSealOptions.map((seal) => (
                        <FormControlLabel
                          key={seal.id}
                          value={seal.id}
                          control={<Radio sx={{ color: '#B89758', '&.Mui-checked': { color: '#B89758' } }} />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: seal.color }} />
                              <Typography variant="caption" sx={{ fontSize: '0.78rem', fontWeight: 500 }}>
                                {seal.name}
                              </Typography>
                            </Box>
                          }
                        />
                      ))}
                    </RadioGroup>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" sx={{ fontFamily: '"Cinzel", serif', letterSpacing: '0.12em', color: '#78716C', display: 'block', mb: 1 }}>
                      Hand-Tied Silk Ribbon
                    </Typography>
                    <RadioGroup
                      value={giftOptions.ribbonColor}
                      onChange={(e) => updateGiftOptions({ ribbonColor: e.target.value })}
                    >
                      {ribbonOptions.map((ribbon) => (
                        <FormControlLabel
                          key={ribbon.id}
                          value={ribbon.id}
                          control={<Radio sx={{ color: '#B89758', '&.Mui-checked': { color: '#B89758' } }} />}
                          label={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 16, height: 8, backgroundColor: ribbon.color, border: '1px solid #CCC' }} />
                              <Typography variant="caption" sx={{ fontSize: '0.78rem', fontWeight: 500 }}>
                                {ribbon.name}
                              </Typography>
                            </Box>
                          }
                        />
                      ))}
                    </RadioGroup>
                  </Grid>
                </Grid>
              </Box>
            </Grid>

            {/* Right Col: Live Card Preview & Order Summary (40%) */}
            <Grid size={{ xs: 12, lg: 5 }}>
              {/* LIVE CALLIGRAPHY PREVIEW CARD */}
              <Box
                sx={{
                  backgroundColor: '#FAF6EE',
                  border: '1px solid rgba(184, 151, 88, 0.35)',
                  boxShadow: '0 8px 30px rgba(184, 151, 88, 0.1)',
                  p: { xs: 3, sm: 4 },
                  mb: 4,
                  position: 'relative',
                  backgroundImage: 'radial-gradient(#E8E2D5 0.75px, transparent 0.75px)',
                  backgroundSize: '16px 16px',
                }}
              >
                {/* Wax Seal Emblem Visual */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -18,
                    right: 28,
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    backgroundColor: waxSealOptions.find((w) => w.id === giftOptions.waxSeal)?.color || '#B89758',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.25)',
                    border: '2px solid #FFFFFF',
                  }}
                >
                  <Box
                    component="img"
                    src="/logo.png"
                    alt=""
                    sx={{ width: 24, height: 24, objectFit: 'contain', filter: 'brightness(1.5)' }}
                  />
                </Box>

                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Cinzel", serif',
                    letterSpacing: '0.2em',
                    color: '#8C6D34',
                    fontSize: '0.68rem',
                    textTransform: 'uppercase',
                    display: 'block',
                    mb: 1.5,
                  }}
                >
                  Atelier Card Preview
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Cinzel", serif',
                    fontSize: '0.78rem',
                    color: '#1C1917',
                    display: 'block',
                    mb: 2,
                  }}
                >
                  To: <strong>{giftOptions.recipientName || 'Our Esteemed Recipient'}</strong>
                </Typography>

                <Typography
                  className="calligraphy-font"
                  sx={{
                    fontSize: '1.45rem',
                    lineHeight: 1.5,
                    color: '#2A2421',
                    my: 2.5,
                    fontStyle: 'italic',
                    minHeight: 70,
                  }}
                >
                  "{giftOptions.calligraphyNote || 'With highest regards.'}"
                </Typography>

                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Cinzel", serif',
                    fontSize: '0.78rem',
                    color: '#1C1917',
                    display: 'block',
                    textAlign: 'right',
                  }}
                >
                  From: <strong>{giftOptions.senderName || 'Anonymous Well-Wisher'}</strong>
                </Typography>
              </Box>

              {/* SUMMARY BOX */}
              <Box
                sx={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(184, 151, 88, 0.25)',
                  p: { xs: 3, md: 4 },
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: '"Cinzel", serif',
                    letterSpacing: '0.15em',
                    color: '#1C1917',
                    mb: 3,
                  }}
                >
                  Parcel Summary
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" sx={{ color: '#78716C' }}>Curated Items Subtotal</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{currency} {subtotal.toFixed(2)}</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" sx={{ color: '#78716C' }}>White-Glove Linen Box & Ribbon</Typography>
                  <Typography variant="body2" sx={{ color: '#B89758', fontWeight: 600 }}>Complimentary</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" sx={{ color: '#78716C' }}>Hand-Poured Wax Seal & Card</Typography>
                  <Typography variant="body2" sx={{ color: '#B89758', fontWeight: 600 }}>Complimentary</Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                  <Typography variant="body2" sx={{ color: '#78716C' }}>Courier delivery</Typography>
                  <Typography variant="body2" sx={{ color: '#78716C', fontWeight: 600 }}>Calculated at checkout</Typography>
                </Box>

                <Divider sx={{ my: 2.5, borderColor: 'rgba(184, 151, 88, 0.2)' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontFamily: '"Cinzel", serif', letterSpacing: '0.1em' }}>
                    Items Total
                  </Typography>
                  <Typography variant="h4" sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, color: '#1C1917' }}>
                    {currency} {total.toFixed(2)}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleCheckout}
                  disabled={submitting}
                  startIcon={<LockOutlined />}
                  sx={{
                    py: 1.8,
                    backgroundColor: '#1C1917',
                    '&:hover': {
                      backgroundColor: '#B89758',
                    },
                  }}
                >
                  Proceed to Secure Checkout
                </Button>

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2 }}>
                  <CheckCircleOutlined sx={{ fontSize: '0.9rem', color: '#B89758' }} />
                  <Typography variant="caption" sx={{ color: '#78716C', fontSize: '0.72rem' }}>
                    Order confirmation and tracking updates in your account
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </Container>

      <Dialog
        open={checkoutModalOpen}
        onClose={() => !orderComplete && setCheckoutModalOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 0,
              backgroundColor: '#FAF8F5',
              border: '1px solid rgba(184, 151, 88, 0.35)',
              p: { xs: 2, sm: 4 },
            },
          },
        }}
      >
        {orderComplete && orderReceipt ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Box
              component="img"
              src="/logo.png"
              alt=""
              sx={{ width: 68, mx: 'auto', mb: 2, filter: 'drop-shadow(0 2px 10px rgba(184,151,88,0.3))' }}
            />
            <Typography variant="h4" sx={{ fontFamily: '"Cormorant Garamond", serif', color: '#1C1917', mb: 1 }}>
              Your Parcel is Commissioned
            </Typography>
            <Typography variant="caption" sx={{ fontFamily: '"Cinzel", serif', letterSpacing: '0.15em', color: '#B89758', display: 'block', mb: 2 }}>
              Order Reference {orderReceipt.orderNumber}
            </Typography>
            <Typography variant="body2" sx={{ color: '#78716C', maxWidth: 440, mx: 'auto', mb: 3 }}>
              Your order has been recorded. Payment is not yet configured, so this order remains awaiting payment.
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setCheckoutModalOpen(false);
                setOrderComplete(false);
                navigate('/account/orders');
              }}
            >
              View My Orders
            </Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={handleConfirmOrder}>
            <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', mb: 0.5 }}>
              Delivery details
            </Typography>
            <Typography variant="caption" sx={{ color: '#78716C', fontFamily: '"Cinzel", serif', display: 'block', mb: 3 }}>
              Signed in as {user?.email || 'customer'}
            </Typography>

            {checkoutError && <Alert severity="error" sx={{ mb: 2 }}>{checkoutError}</Alert>}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mb: 3 }}>
              {savedAddresses.length > 0 && <Alert severity="success" sx={{ gridColumn: '1 / -1' }}>Your most recently saved delivery address has been filled in.</Alert>}
              <TextField required label="Recipient name" value={address.fullName} onChange={(event) => setAddress({ ...address, fullName: event.target.value })} />
              <TextField required type="email" label="Contact email" value={address.email} onChange={(event) => setAddress({ ...address, email: event.target.value })} />
              <TextField required label="Address" sx={{ gridColumn: '1 / -1' }} value={address.addressLine1} onChange={(event) => setAddress({ ...address, addressLine1: event.target.value })} />
              <TextField required label="City" value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} />
              <TextField required label="State / region" value={address.state} onChange={(event) => setAddress({ ...address, state: event.target.value })} />
              <TextField required label="Postal code" value={address.postalCode} onChange={(event) => setAddress({ ...address, postalCode: event.target.value })} />
              <TextField required label="Country" value={address.country} onChange={(event) => setAddress({ ...address, country: event.target.value })} />
              <TextField label="Coupon code" value={couponCode} onChange={(event) => setCouponCode(event.target.value.toUpperCase())} sx={{ gridColumn: '1 / -1' }} />
            </Box>

            <Box sx={{ p: 2, backgroundColor: '#FFFFFF', border: '1px solid rgba(184, 151, 88, 0.2)', mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#78716C' }}>Total Order Value:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{quote?.currency || currency} {Number(quote?.total ?? total).toFixed(2)}</Typography>
              </Box>
              {quote && <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary">Subtotal {quote.currency} {quote.subtotal.toFixed(2)}</Typography>
                {quote.discountAmount > 0 && <Typography variant="caption" color="success.main">Discount −{quote.currency} {quote.discountAmount.toFixed(2)}</Typography>}
                <Typography variant="caption" color="text.secondary">Shipping {quote.currency} {quote.shippingAmount.toFixed(2)}</Typography>
                <Typography variant="caption" color="text.secondary">Tax {quote.currency} {quote.taxAmount.toFixed(2)}</Typography>
              </Stack>}
              <Typography variant="caption" sx={{ color: '#B89758', display: 'block' }}>
                Shipping charges are calculated from the store settings shown above.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={() => setCheckoutModalOpen(false)} disabled={submitting}>
                Modify Parcel
              </Button>
              <Button type="submit" variant="contained" disabled={submitting || !quote}>
                {submitting ? <CircularProgress size={21} color="inherit" /> : 'Place order'}
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};
