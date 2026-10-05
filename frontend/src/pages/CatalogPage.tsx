import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Button,
  IconButton,
  TextField,
  MenuItem,
  InputAdornment,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Favorite, FavoriteBorder, SearchOutlined, ShoppingBagOutlined, VisibilityOutlined } from '@mui/icons-material';
import { products as fallbackProducts } from '../data/products';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { QuickViewModal } from '../components/catalog/QuickViewModal';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useStoreCurrency } from '../context/StoreSettings';

const CATEGORIES = [
  'All Collections',
  'Heirloom Boxes',
  'Tea & Rituals',
  'Scent & Sanctuary',
  'Epicurean Reserve',
  'Bar & Leather',
] as const;

const OCCASIONS = [
  'All Occasions',
  'Milestone Celebrations',
  'Executive Gratitude',
  'Weddings & Betrothals',
  'Solace & Sanctuary',
];

export const CatalogPage: React.FC = () => {
  const { addToCart } = useCart();
  const { token } = useAuth();
  const navigate = useNavigate();
  const currency = useStoreCurrency();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [selectedCategory, setSelectedCategory] = useState<string>('All Collections');
  const [selectedOccasion, setSelectedOccasion] = useState<string>('All Occasions');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'curated' | 'price-asc' | 'price-desc'>('curated');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(fallbackProducts);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    if (!token) return;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/v1/account/wishlist`, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.json())
      .then((result) => { if (result.success) setWishlistIds(result.data.products.map((product: Product) => product.id)); })
      .catch(() => undefined);
  }, [token]);


  async function toggleWishlist(product: Product) {
    if (!token) { navigate('/login'); return; }
    const isSaved = wishlistIds.includes(product.id);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl}/api/v1/account/wishlist${isSaved ? `/${encodeURIComponent(product.id)}` : ''}`, {
      method: isSaved ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      ...(!isSaved ? { body: JSON.stringify({ productId: product.id }) } : {}),
    });
    if (response.ok) setWishlistIds((current) => isSaved ? current.filter((id) => id !== product.id) : [...current, product.id]);
  }

  useEffect(() => {
    let active = true;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    fetch(`${apiUrl}/api/v1/products`)
      .then(async (response) => {
        if (!response.ok) throw new Error('Catalog API is unavailable.');
        const result = await response.json();
        if (!result.success || !Array.isArray(result.data?.products)) throw new Error('Invalid catalog response.');
        return result.data.products as Array<Record<string, unknown>>;
      })
      .then((apiProducts) => {
        if (!active) return;
        const normalized = apiProducts.map((product) => ({
          ...product,
          tagline: String(product.tagline || ''),
          category: String(product.category || 'Heirloom Boxes') as Product['category'],
          occasion: String(product.occasion || 'Milestone Celebrations') as Product['occasion'],
          image: String(product.image || '/hero_gifting.jpg'),
          description: String(product.description || ''),
          provenance: String(product.provenance || ''),
          contents: Array.isArray(product.contents) ? product.contents.map(String) : [],
        })) as Product[];
        setCatalogProducts(normalized);
      })
      .catch(() => {
        // Keep bundled products available if the API is offline.
      });
    return () => { active = false; };
  }, []);

  const filteredProducts = useMemo(() => {
    return catalogProducts
      .filter((product) => {
        const matchesCategory =
          selectedCategory === 'All Collections' || product.category === selectedCategory;
        const matchesOccasion =
          selectedOccasion === 'All Occasions' || product.occasion === selectedOccasion;
        const matchesSearch =
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesOccasion && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        return 0; // curated order
      });
  }, [catalogProducts, selectedCategory, selectedOccasion, searchQuery, sortBy]);

  return (
    <Box sx={{ backgroundColor: '#FAF8F5', minHeight: '85vh', pb: 12 }}>
      {/* Editorial Header */}
      <Box
        sx={{
          backgroundColor: '#F5F2EC',
          borderBottom: '1px solid rgba(184, 151, 88, 0.25)',
          py: { xs: 7, md: 10 },
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="caption"
            sx={{
              fontFamily: '"Cinzel", serif',
              letterSpacing: '0.3em',
              color: '#B89758',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              display: 'block',
              mb: 1.5,
            }}
          >
            The Atelier Catalog
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontFamily: '"Cormorant Garamond", Georgia, serif',
              fontSize: { xs: '2.4rem', md: '3.6rem' },
              color: '#1C1917',
              mb: 2,
            }}
          >
            Heirloom Curations & Fine Provisions
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#78716C',
              maxWidth: 580,
              mx: 'auto',
              lineHeight: 1.8,
            }}
          >
            Explore our curated gift boxes and individual artisanal provisions, each sourced from independent heritage ateliers across the globe.
          </Typography>
        </Container>
      </Box>

      {/* Filter & Search Bar */}
      <Container maxWidth="xl" sx={{ pt: 4, pb: 2 }}>
        {/* Category Tabs */}
        <Box sx={{ borderBottom: '1px solid rgba(184, 151, 88, 0.2)', mb: 3.5 }}>
          <Tabs
            value={selectedCategory}
            onChange={(_, val) => setSelectedCategory(val)}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            centered={!isMobile}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#B89758',
                height: 2,
              },
            }}
          >
            {CATEGORIES.map((cat) => (
              <Tab
                key={cat}
                value={cat}
                label={cat}
                sx={{
                  fontFamily: '"Cinzel", serif',
                  fontSize: '0.75rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: '#78716C',
                  py: 1.8,
                  px: 2.5,
                  '&.Mui-selected': {
                    color: '#1C1917',
                    fontWeight: 600,
                  },
                }}
              />
            ))}
          </Tabs>
        </Box>

        {/* Secondary Filter Controls: Occasion, Search, Sort */}
        <Grid container spacing={2.5} sx={{ alignItems: 'center', mb: 5 }}>
          <Grid size={{ xs: 12, sm: 4, md: 3 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Occasion"
              value={selectedOccasion}
              onChange={(e) => setSelectedOccasion(e.target.value)}
              slotProps={{
                inputLabel: { sx: { fontFamily: '"Cinzel", serif', fontSize: '0.75rem' } },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.85rem',
                  '& fieldset': { borderColor: 'rgba(184, 151, 88, 0.25)' },
                },
              }}
            >
              {OCCASIONS.map((occ) => (
                <MenuItem key={occ} value={occ} sx={{ fontSize: '0.85rem' }}>
                  {occ}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, sm: 4, md: 5 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search botanical, tea, crystal, journal..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined sx={{ color: '#B89758', fontSize: '1.2rem' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.85rem',
                  '& fieldset': { borderColor: 'rgba(184, 151, 88, 0.25)' },
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 4, md: 4 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Sort By"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              slotProps={{
                inputLabel: { sx: { fontFamily: '"Cinzel", serif', fontSize: '0.75rem' } },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  backgroundColor: '#FFFFFF',
                  fontSize: '0.85rem',
                  '& fieldset': { borderColor: 'rgba(184, 151, 88, 0.25)' },
                },
              }}
            >
              <MenuItem value="curated" sx={{ fontSize: '0.85rem' }}>Curator's Choice</MenuItem>
              <MenuItem value="price-asc" sx={{ fontSize: '0.85rem' }}>Price: Modest to Highest</MenuItem>
              <MenuItem value="price-desc" sx={{ fontSize: '0.85rem' }}>Price: Highest to Modest</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 10 }}>
            <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", serif', color: '#1C1917' }}>
              No curations match your criteria
            </Typography>
            <Typography variant="body2" sx={{ color: '#78716C', mt: 1, mb: 3 }}>
              Try selecting a different occasion or clearing your search term.
            </Typography>
            <Button
              variant="outlined"
              onClick={() => {
                setSelectedCategory('All Collections');
                setSelectedOccasion('All Occasions');
                setSearchQuery('');
              }}
            >
              Reset Filters
            </Button>
          </Box>
        ) : (
          <Grid container spacing={3.5}>
            {filteredProducts.map((product) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
                <Card
                  className="gold-glow-hover"
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid rgba(184, 151, 88, 0.22)',
                    position: 'relative',
                  }}
                >
                  {/* Image with quick view hover */}
                  <Box
                    sx={{
                      position: 'relative',
                      pt: '100%',
                      overflow: 'hidden',
                      backgroundColor: '#F5F2EC',
                      cursor: 'pointer',
                    }}
                    onClick={() => setQuickViewProduct(product)}
                  >
                    <IconButton
                      aria-label={wishlistIds.includes(product.id) ? 'Remove from saved gifts' : 'Save gift'}
                      onClick={(event) => { event.stopPropagation(); void toggleWishlist(product); }}
                      sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1, bgcolor: 'rgba(255,255,255,.92)', '&:hover': { bgcolor: '#fff' } }}
                    >
                      {wishlistIds.includes(product.id) ? <Favorite sx={{ color: '#9b4b4b' }} /> : <FavoriteBorder />}
                    </IconButton>
                    <CardMedia
                      component="img"
                      image={product.image}
                      alt={product.name}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                        '&:hover': { transform: 'scale(1.06)' },
                      }}
                    />
                    {product.badge && (
                      <Chip
                        label={product.badge}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 14,
                          left: 14,
                          backgroundColor: 'rgba(28, 25, 23, 0.88)',
                          color: '#FAF8F5',
                          fontFamily: '"Cinzel", serif',
                          fontSize: '0.62rem',
                          letterSpacing: '0.12em',
                          borderRadius: 0,
                        }}
                      />
                    )}

                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 12,
                        right: 12,
                        backgroundColor: 'rgba(250, 248, 245, 0.92)',
                        backdropFilter: 'blur(4px)',
                        px: 1.2,
                        py: 0.6,
                        border: '1px solid rgba(184, 151, 88, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.6,
                        fontSize: '0.68rem',
                        fontFamily: '"Cinzel", serif',
                        letterSpacing: '0.1em',
                        color: '#1C1917',
                      }}
                    >
                      <VisibilityOutlined sx={{ fontSize: '0.9rem', color: '#B89758' }} />
                      Quick View
                    </Box>
                  </Box>

                  {/* Card Content */}
                  <CardContent sx={{ flex: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontFamily: '"Cinzel", serif',
                        letterSpacing: '0.18em',
                        color: '#B89758',
                        fontSize: '0.65rem',
                        textTransform: 'uppercase',
                        display: 'block',
                        mb: 0.8,
                      }}
                    >
                      {product.category}
                    </Typography>

                    <Typography
                      variant="h6"
                      onClick={() => setQuickViewProduct(product)}
                      sx={{
                        fontFamily: '"Cormorant Garamond", serif',
                        fontSize: '1.28rem',
                        lineHeight: 1.25,
                        color: '#1C1917',
                        cursor: 'pointer',
                        mb: 0.6,
                        '&:hover': { color: '#B89758' },
                      }}
                    >
                      {product.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color: '#78716C',
                        fontSize: '0.8rem',
                        lineHeight: 1.5,
                        mb: 2,
                        flex: 1,
                      }}
                    >
                      {product.tagline}
                    </Typography>

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        pt: 1.5,
                        borderTop: '1px solid rgba(184, 151, 88, 0.15)',
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontFamily: '"Plus Jakarta Sans", sans-serif',
                          fontWeight: 600,
                          color: '#1C1917',
                          fontSize: '1.05rem',
                        }}
                      >
                        {currency} {product.price.toFixed(2)}
                      </Typography>

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => addToCart(product, 1)}
                        startIcon={<ShoppingBagOutlined sx={{ fontSize: '0.9rem' }} />}
                        sx={{
                          fontFamily: '"Cinzel", serif',
                          fontSize: '0.68rem',
                          letterSpacing: '0.08em',
                          py: 0.7,
                          px: 1.6,
                        }}
                      >
                        Add
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        open={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </Box>
  );
};
