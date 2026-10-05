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
  Alert,
  TextField,
  MenuItem,
} from '@mui/material';
import { CloseOutlined, ShoppingBagOutlined, Check } from '@mui/icons-material';
import type { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useStoreCurrency } from '../../context/StoreSettings';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
type Review = { id: string; userName: string; rating: number; title: string; body: string };

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, open, onClose }) => {
  const { addToCart } = useCart();
  const { token } = useAuth();
  const currency = useStoreCurrency();
  const [added, setAdded] = React.useState(false);
  const [reviews, setReviews] = React.useState<Review[]>([]);
  const [reviewForm, setReviewForm] = React.useState({ rating: 5, title: '', body: '' });
  const [reviewNotice, setReviewNotice] = React.useState('');
  const [reviewError, setReviewError] = React.useState('');

  React.useEffect(() => {
    if (!product || !open) return;
    fetch(`${API_BASE_URL}/api/v1/products/${encodeURIComponent(product.id)}/reviews`)
      .then(async (response) => {
        const result = await response.json();
        if (response.ok && result.success) setReviews(result.data.reviews);
      })
      .catch(() => undefined);
  }, [open, product]);

  if (!product) return null;

  const handleAdd = () => {
    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 900);
  };

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setReviewError(''); setReviewNotice('');
    if (!product) return;
    if (!token) { setReviewError('Sign in to submit a review.'); return; }
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${encodeURIComponent(product.id)}/reviews`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(reviewForm),
    });
    const result = await response.json();
    if (!response.ok || !result.success) { setReviewError(result.error?.message || 'Review could not be submitted.'); return; }
    setReviewNotice('Your review was submitted for moderation.');
    setReviewForm({ rating: 5, title: '', body: '' });
  }

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
              {currency} {product.price.toFixed(2)}
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

            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ fontFamily: '"Cinzel", serif', color: '#78716C', letterSpacing: '.12em', display: 'block', mb: 1 }}>Client reviews</Typography>
              {reviews.length ? reviews.map((review) => <Box key={review.id} sx={{ py: 1, borderBottom: '1px solid rgba(184,151,88,.18)' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{review.title} · {review.rating}/5 stars</Typography>
                <Typography variant="caption" color="text.secondary">{review.userName}</Typography>
                <Typography variant="body2">{review.body}</Typography>
              </Box>) : <Typography variant="caption" color="text.secondary">No published reviews yet.</Typography>}
            </Box>

            <Box component="form" onSubmit={submitReview} sx={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 1, mb: 2 }}>
              <TextField select label="Rating" size="small" value={reviewForm.rating} onChange={(event) => setReviewForm({ ...reviewForm, rating: Number(event.target.value) })}>
                {[5, 4, 3, 2, 1].map((rating) => <MenuItem key={rating} value={rating}>{rating} stars</MenuItem>)}
              </TextField>
              <TextField required label="Review title" size="small" value={reviewForm.title} onChange={(event) => setReviewForm({ ...reviewForm, title: event.target.value })} />
              <TextField required multiline minRows={2} label="Your review" sx={{ gridColumn: '1 / -1' }} value={reviewForm.body} onChange={(event) => setReviewForm({ ...reviewForm, body: event.target.value })} />
              {reviewError && <Alert severity="error" sx={{ gridColumn: '1 / -1' }}>{reviewError}</Alert>}
              {reviewNotice && <Alert severity="success" sx={{ gridColumn: '1 / -1' }}>{reviewNotice}</Alert>}
              <Button type="submit" variant="outlined" sx={{ gridColumn: '1 / -1', justifySelf: 'end' }}>Submit review</Button>
            </Box>

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
