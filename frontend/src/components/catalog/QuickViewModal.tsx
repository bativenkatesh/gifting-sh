import React from 'react';
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  Button,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import { CloseOutlined, ShoppingBagOutlined, Check } from '@mui/icons-material';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, open, onClose }) => {
  const { addToCart } = useCart();
  const [added, setAdded] = React.useState(false);

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 0,
            backgroundColor: '#FAF8F5',
            border: '1px solid rgba(184, 151, 88, 0.35)',
            boxShadow: '0 25px 80px rgba(0,0,0,0.2)',
            p: 0,
            overflow: 'hidden',
          },
        },
      }}
    >
      <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 10 }}>
        <IconButton
          onClick={onClose}
          sx={{
            backgroundColor: 'rgba(250, 248, 245, 0.8)',
            backdropFilter: 'blur(4px)',
            '&:hover': { backgroundColor: '#FAF8F5' },
          }}
        >
          <CloseOutlined fontSize="small" />
        </IconButton>
      </Box>

      <Grid container>
        {/* Left: Imagery */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              height: { xs: 280, md: '100%' },
              minHeight: { md: 450 },
              position: 'relative',
              backgroundColor: '#F5F2EC',
            }}
          >
            <Box
              component="img"
              src={product.image}
              alt={product.name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            {product.badge && (
              <Chip
                label={product.badge}
                size="small"
                sx={{
                  position: 'absolute',
                  top: 16,
                  left: 16,
                  backgroundColor: 'rgba(28, 25, 23, 0.88)',
                  color: '#FAF8F5',
                  fontFamily: '"Cinzel", serif',
                  fontSize: '0.65rem',
                  letterSpacing: '0.12em',
                  borderRadius: 0,
                }}
              />
            )}
          </Box>
        </Grid>

        {/* Right: Details & Provenance */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Box sx={{ p: { xs: 3, sm: 4.5 }, display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center' }}>
            <Typography
              variant="caption"
              sx={{
                fontFamily: '"Cinzel", serif',
                color: '#B89758',
                letterSpacing: '0.22em',
                fontSize: '0.7rem',
                textTransform: 'uppercase',
                display: 'block',
                mb: 1,
              }}
            >
              {product.category}
            </Typography>

            <Typography
              variant="h4"
              sx={{
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: { xs: '1.6rem', md: '2rem' },
                color: '#1C1917',
                lineHeight: 1.15,
                mb: 1,
              }}
            >
              {product.name}
            </Typography>

            <Typography
              variant="subtitle1"
              sx={{
                color: '#78716C',
                fontStyle: 'italic',
                fontSize: '0.88rem',
                mb: 2,
              }}
            >
              {product.tagline}
            </Typography>

            <Typography
              variant="h5"
              sx={{
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                fontWeight: 600,
                color: '#B89758',
                fontSize: '1.4rem',
                mb: 2.5,
              }}
            >
              ${product.price.toFixed(2)}
            </Typography>

            <Divider sx={{ mb: 2.5, borderColor: 'rgba(184, 151, 88, 0.2)' }} />

            <Typography
              variant="body2"
              sx={{
                color: '#44403C',
                lineHeight: 1.7,
                fontSize: '0.88rem',
                mb: 2.5,
              }}
            >
              {product.description}
            </Typography>

            {/* Provenance */}
            <Box sx={{ mb: 2.5, p: 1.5, backgroundColor: 'rgba(184, 151, 88, 0.06)', borderLeft: '2px solid #B89758' }}>
              <Typography variant="caption" sx={{ fontFamily: '"Cinzel", serif', color: '#8C6D34', fontWeight: 600, letterSpacing: '0.1em' }}>
                Provenance & Origin
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.82rem', color: '#1C1917' }}>
                {product.provenance}
              </Typography>
            </Box>

            {/* Contents */}
            {product.contents && product.contents.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="caption" sx={{ fontFamily: '"Cinzel", serif', color: '#78716C', letterSpacing: '0.12em', display: 'block', mb: 1 }}>
                  Curated Contents
                </Typography>
                <Box component="ul" sx={{ pl: 2.5, m: 0 }}>
                  {product.contents.map((item, i) => (
                    <Typography key={i} component="li" variant="caption" sx={{ color: '#57534E', display: 'list-item', mb: 0.4 }}>
                      {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            )}

            {/* Action */}
            <Button
              fullWidth
              variant="contained"
              onClick={handleAdd}
              startIcon={added ? <Check /> : <ShoppingBagOutlined />}
              sx={{
                py: 1.6,
                backgroundColor: added ? '#B89758' : '#1C1917',
                '&:hover': {
                  backgroundColor: '#B89758',
                },
              }}
            >
              {added ? 'Added to Curated Parcel' : 'Place in Parcel'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Dialog>
  );
};
