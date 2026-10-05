import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Box, Button, Container, IconButton, Stack, Typography } from '@mui/material';
import { DeleteOutlined, ShoppingBagOutlined } from '@mui/icons-material';
import type { Product } from '../types';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useStoreCurrency } from '../context/StoreSettings';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function WishlistPage() {
  const { token } = useAuth();
  const { addToCart } = useCart();
  const currency = useStoreCurrency();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE_URL}/api/v1/account/wishlist`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error?.message || 'Could not load your wishlist.');
        setProducts(result.data.products);
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Could not load your wishlist.'));
  }, [token]);

  async function remove(productId: string) {
    if (!token) return;
    const response = await fetch(`${API_BASE_URL}/api/v1/account/wishlist/${encodeURIComponent(productId)}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    if (response.ok) setProducts((current) => current.filter((product) => product.id !== productId));
  }

  return (
    <Box sx={{ minHeight: '70vh', bgcolor: '#FAF8F5', py: { xs: 5, md: 8 } }}>
      <Container maxWidth="md">
        <Typography variant="overline" sx={{ color: '#9a7a3e', letterSpacing: '.2em' }}>Client account</Typography>
        <Typography variant="h2" sx={{ fontFamily: '"Cormorant Garamond", Georgia, serif', mb: 3 }}>Saved gifts</Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {products.length ? <Stack divider={<Box sx={{ borderBottom: '1px solid rgba(184,151,88,.25)' }} />}>
          {products.map((product) => <Stack key={product.id} direction="row" spacing={2} sx={{ alignItems: 'center', py: 2 }}>
            <Box component="img" src={product.image} alt={product.name} sx={{ width: 76, height: 76, objectFit: 'cover' }} />
            <Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 700 }}>{product.name}</Typography><Typography variant="body2" color="text.secondary">{currency} {Number(product.price).toFixed(2)}</Typography></Box>
            <IconButton aria-label={`Remove ${product.name}`} onClick={() => void remove(product.id)}><DeleteOutlined /></IconButton>
            <Button startIcon={<ShoppingBagOutlined />} onClick={() => addToCart(product)}>Add</Button>
          </Stack>)}
        </Stack> : !error && <Box sx={{ py: 5 }}><Typography color="text.secondary">Your saved gifts will appear here.</Typography><Button component={Link} to="/catalog" sx={{ mt: 1 }}>Explore the catalog</Button></Box>}
      </Container>
    </Box>
  );
}
