import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  Divider,
  List,
  ListItem,
} from '@mui/material';
import { CloseOutlined, Add, Remove, DeleteOutlined, ArrowForward } from '@mui/icons-material';
import { useCart } from '../../context/CartContext';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    totalItems,
  } = useCart();
  const navigate = useNavigate();

  const handleGoToCart = () => {
    closeCart();
    navigate('/cart');
  };

  return (
    <Drawer
      anchor="right"
      open={isCartOpen}
      onClose={closeCart}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', sm: 460 },
            backgroundColor: '#FAF8F5',
            borderLeft: '1px solid rgba(184, 151, 88, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 2.5, sm: 3.5 },
          },
        },
      }}
    >
      {/* Drawer Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: '"Cormorant Garamond", serif',
              fontSize: '1.4rem',
              fontWeight: 600,
              letterSpacing: '0.05em',
              color: '#1C1917',
            }}
          >
            Your Curated Parcel
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontFamily: '"Cinzel", serif',
              fontSize: '0.68rem',
              letterSpacing: '0.15em',
              color: '#B89758',
              textTransform: 'uppercase',
            }}
          >
            {totalItems} {totalItems === 1 ? 'Heirloom Selection' : 'Heirloom Selections'}
          </Typography>
        </Box>
        <IconButton onClick={closeCart} aria-label="Close cart">
          <CloseOutlined />
        </IconButton>
      </Box>

      <Divider sx={{ my: 1, borderColor: 'rgba(184, 151, 88, 0.2)' }} />

      {/* Items List */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 2 }}>
        {items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Box
              component="img"
              src="/logo.png"
              alt=""
              sx={{ width: 64, opacity: 0.35, mb: 2 }}
            />
            <Typography
              variant="h6"
              sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.25rem', color: '#1C1917' }}
            >
              Your parcel is presently unadorned
            </Typography>
            <Typography variant="body2" sx={{ color: '#78716C', mt: 1, mb: 3 }}>
              Explore our curated gift boxes or craft a bespoke ensemble.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                closeCart();
                navigate('/catalog');
              }}
            >
              Discover The Catalog
            </Button>
          </Box>
        ) : (
          <List disablePadding>
            {items.map((item) => (
              <ListItem
                key={item.id}
                disableGutters
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  py: 2,
                  borderBottom: '1px solid rgba(184, 151, 88, 0.15)',
                }}
              >
                {/* Thumbnail */}
                <Box
                  component="img"
                  src={item.product.image}
                  alt={item.product.name}
                  sx={{
                    width: 76,
                    height: 76,
                    objectFit: 'cover',
                    border: '1px solid rgba(184, 151, 88, 0.25)',
                    mr: 2,
                    flexShrink: 0,
                  }}
                />

                {/* Details */}
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontWeight: 600,
                      fontSize: '1.05rem',
                      lineHeight: 1.2,
                      color: '#1C1917',
                    }}
                  >
                    {item.product.name}
                  </Typography>

                  {item.customizations?.boxStyle && (
                    <Typography variant="caption" sx={{ color: '#78716C', display: 'block', fontSize: '0.72rem' }}>
                      Box: {item.customizations.boxStyle}
                    </Typography>
                  )}

                  <Typography
                    variant="body2"
                    sx={{
                      color: '#B89758',
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontWeight: 600,
                      mt: 0.5,
                      fontSize: '0.9rem',
                    }}
                  >
                    ${item.product.price.toFixed(2)}
                  </Typography>

                  {/* Quantity controls */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid rgba(184, 151, 88, 0.3)',
                        px: 0.5,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, -1)}
                        sx={{ p: 0.4, color: '#1C1917' }}
                      >
                        <Remove sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                      <Typography sx={{ px: 1, fontSize: '0.82rem', fontWeight: 600 }}>
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.id, 1)}
                        sx={{ p: 0.4, color: '#1C1917' }}
                      >
                        <Add sx={{ fontSize: '0.9rem' }} />
                      </IconButton>
                    </Box>

                    <IconButton
                      size="small"
                      onClick={() => removeFromCart(item.id)}
                      sx={{ color: '#A8A29E', '&:hover': { color: '#C98A90' } }}
                    >
                      <DeleteOutlined sx={{ fontSize: '1.05rem' }} />
                    </IconButton>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Drawer Footer / Checkout CTA */}
      {items.length > 0 && (
        <Box sx={{ pt: 2, borderTop: '1px solid rgba(184, 151, 88, 0.25)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" sx={{ color: '#78716C', fontFamily: '"Cinzel", serif', fontSize: '0.75rem' }}>
              Complimentary Packaging
            </Typography>
            <Typography variant="body2" sx={{ color: '#B89758', fontWeight: 600, fontSize: '0.8rem' }}>
              Included
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 2.5 }}>
            <Typography variant="subtitle1" sx={{ fontFamily: '"Cinzel", serif', letterSpacing: '0.1em', fontWeight: 600 }}>
              Estimated Total
            </Typography>
            <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 700, color: '#1C1917' }}>
              ${subtotal.toFixed(2)}
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleGoToCart}
            endIcon={<ArrowForward />}
            sx={{ py: 1.5, mb: 1.5 }}
          >
            Review Cart & Calligraphy Note
          </Button>

          <Typography
            variant="caption"
            sx={{
              display: 'block',
              textAlign: 'center',
              color: '#78716C',
              fontSize: '0.7rem',
              letterSpacing: '0.05em',
            }}
          >
            Hand-tied silk ribbon & wax seal selection included in full review.
          </Typography>
        </Box>
      )}
    </Drawer>
  );
};
