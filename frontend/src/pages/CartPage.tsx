import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
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
  const navigate = useNavigate();

  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  const handleCheckout = () => {
    setCheckoutModalOpen(true);
  };

  const handleConfirmOrder = () => {
    setOrderComplete(true);
    setTimeout(() => {
      clearCart();
    }, 1500);
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
                          ${item.product.price.toFixed(2)} each
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
                          ${(item.product.price * item.quantity).toFixed(2)}
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
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>${subtotal.toFixed(2)}</Typography>
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
                  <Typography variant="body2" sx={{ color: '#78716C' }}>Insured White-Glove Courier</Typography>
                  <Typography variant="body2" sx={{ color: '#B89758', fontWeight: 600 }}>Complimentary</Typography>
                </Box>

                <Divider sx={{ my: 2.5, borderColor: 'rgba(184, 151, 88, 0.2)' }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontFamily: '"Cinzel", serif', letterSpacing: '0.1em' }}>
                    Grand Total
                  </Typography>
                  <Typography variant="h4" sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, color: '#1C1917' }}>
                    ${total.toFixed(2)}
                  </Typography>
                </Box>

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleCheckout}
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
                    Encrypted White-Glove Fulfillment & Tracking
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </Container>

      {/* Checkout Modal Simulation */}
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
        {orderComplete ? (
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
              Order Reference #ML-{Math.floor(100000 + Math.random() * 900000)}
            </Typography>
            <Typography variant="body2" sx={{ color: '#78716C', maxWidth: 440, mx: 'auto', mb: 3 }}>
              Our master calligraphers and packers have begun preparing your presentation box. A courier dispatch notice will be transmitted upon sealing.
            </Typography>
            <Button
              variant="contained"
              onClick={() => {
                setCheckoutModalOpen(false);
                setOrderComplete(false);
                navigate('/');
              }}
            >
              Return to The Atelier
            </Button>
          </Box>
        ) : (
          <Box>
            <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.6rem', mb: 0.5 }}>
              Confirm White-Glove Dispatch
            </Typography>
            <Typography variant="caption" sx={{ color: '#78716C', fontFamily: '"Cinzel", serif', display: 'block', mb: 3 }}>
              Sannidhi Collective Private Delivery Protocol
            </Typography>

            <Alert severity="info" sx={{ mb: 3, borderRadius: 0, backgroundColor: 'rgba(184, 151, 88, 0.1)', color: '#8C6D34' }}>
              Your parcel includes <strong>{giftOptions.recipientName}</strong>'s handwritten calligraphy card with the <strong>{waxSealOptions.find(w => w.id === giftOptions.waxSeal)?.name}</strong>.
            </Alert>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <TextField label="Courier Delivery Address" variant="outlined" size="small" defaultValue="45 Eaton Square, Belgravia, London" fullWidth />
              <TextField label="Special Delivery Instructions" variant="outlined" size="small" placeholder="e.g. Leave with private concierge" fullWidth />
            </Box>

            <Box sx={{ p: 2, backgroundColor: '#FFFFFF', border: '1px solid rgba(184, 151, 88, 0.2)', mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: '#78716C' }}>Total Order Value:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>${total.toFixed(2)}</Typography>
              </Box>
              <Typography variant="caption" sx={{ color: '#B89758', display: 'block' }}>
                Complimentary worldwide insured courier service included.
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button variant="outlined" onClick={() => setCheckoutModalOpen(false)}>
                Modify Parcel
              </Button>
              <Button variant="contained" onClick={handleConfirmOrder}>
                Authorize & Seal Parcel
              </Button>
            </Box>
          </Box>
        )}
      </Dialog>
    </Box>
  );
};
