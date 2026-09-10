import React, { useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  CssBaseline,
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardMedia,
  TextField,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  AppBar,
  Toolbar,
  Badge,
  Rating,
  useMediaQuery,
  Collapse,
} from '@mui/material';
import {
  ShoppingBagOutlined,
  SearchOutlined,
  FavoriteBorderOutlined,
  MenuOutlined,
  CloseOutlined,
  ArrowForwardOutlined,
  LocalShippingOutlined,
  SpaOutlined,
  LocalFloristOutlined,
  Instagram,
  Facebook,
  Pinterest,
} from '@mui/icons-material';

// Define the custom Earthy theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#A96F56', // Warm Terracotta
      contrastText: '#FFFDF9',
    },
    secondary: {
      main: '#5C6B5E', // Sage Green
      contrastText: '#FFFDF9',
    },
    background: {
      default: '#F7F5F0', // Cream / Warm Sand
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2A2725', // Warm Black
      secondary: '#6B6560', // Muted Clay
    },
    divider: '#E4E0D9',
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Cormorant Garamond", "Georgia", serif',
      fontWeight: 500,
    },
    h2: {
      fontFamily: '"Cormorant Garamond", "Georgia", serif',
      fontWeight: 500,
    },
    h3: {
      fontFamily: '"Cormorant Garamond", "Georgia", serif',
      fontWeight: 500,
    },
    h4: {
      fontFamily: '"Cormorant Garamond", "Georgia", serif',
      fontWeight: 500,
    },
    h5: {
      fontFamily: '"Cormorant Garamond", "Georgia", serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: '"Cormorant Garamond", "Georgia", serif',
      fontWeight: 600,
    },
    subtitle1: {
      fontFamily: '"Inter", sans-serif',
      fontWeight: 400,
    },
    body1: {
      fontFamily: '"Inter", sans-serif',
      lineHeight: 1.7,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          textTransform: 'none',
          padding: '12px 28px',
          fontWeight: 500,
          fontSize: '0.95rem',
          letterSpacing: '0.5px',
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          border: '1px solid #E4E0D9',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        },
      },
    },
  },
});

// Mock Curated Gift Boxes Data
const curatedBoxes = [
  {
    id: 1,
    title: 'The Botanical Box',
    subtitle: 'Nurturing • Calming • Organic',
    price: '$92.00',
    image: '/botanical_box.jpg',
    tags: ['Best Seller', 'Spa'],
    description: 'A soothing package with organic eucalyptus soy candle, natural sage, premium body oil, and waffle face cloth.',
  },
  {
    id: 2,
    title: 'The Cozy Ceramic Tea Box',
    subtitle: 'Warmth • Ritual • Presence',
    price: '$115.00',
    image: '/tea_box.jpg',
    tags: ['New', 'Ceramics'],
    description: 'An earthy glaze stoneware tea mug, organic loose chamomile flower tea, custom wood scoop, and linen towel.',
  },
  {
    id: 3,
    title: 'The Spa & Wellness Box',
    subtitle: 'Restorative • Relaxing • Soft',
    price: '$128.00',
    image: '/spa_box.jpg',
    tags: ['Luxury'],
    description: 'Hand-poured lavender essential oil candle, Himalayan pink crystal bath salts, dry brush, and woven waffle towels.',
  },
];

// Testimonials Data
const testimonials = [
  {
    quote: "Receiving the Ceramic Tea Box felt like opening a warm embrace. The attention to detail, from the hand-tied linen ribbon to the handwritten calligraphic note, made it feel incredibly premium.",
    author: "Elena R.",
    role: "Gift Recipient",
    stars: 5,
  },
  {
    quote: "Clay & Fern has completely elevated our corporate gifting. The sustainable packaging and organic products aligned perfectly with our brand's values, and the feedback was stellar.",
    author: "Marcus T.",
    role: "Founder, Bloom Studio",
    stars: 5,
  },
  {
    quote: "The ability to hand-pick each piece and have it wrapped in their signatures boxes with dried florals is unmatched. A flawless, intentional gifting experience from start to finish.",
    author: "Sophia L.",
    role: "Regular Customer",
    stars: 5,
  },
];

const Home: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedBoxSize, setSelectedBoxSize] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleAddToCart = () => {
    setCartCount(prev => prev + 1);
  };

  const handleToggleItem = (item: string) => {
    setSelectedItems(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleResetBuilder = () => {
    setSelectedBoxSize(null);
    setSelectedItems([]);
    setActiveStep(0);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      
      {/* 1. TOP ANNOUNCEMENT BAR */}
      <Box
        sx={{
          bgcolor: 'secondary.main',
          color: 'background.default',
          textAlign: 'center',
          py: 1,
          px: 2,
          fontSize: '0.8rem',
          letterSpacing: '1px',
          fontWeight: 500,
          textTransform: 'uppercase',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        Free premium handwritten cards & shipping on orders over $150
      </Box>

      {/* 2. NAVIGATION BAR */}
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{
          bgcolor: 'rgba(247, 245, 240, 0.9)',
          backdropFilter: 'blur(8px)',
          borderBottom: '1px solid #E4E0D9',
          zIndex: 1100,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: '80px' }}>
            {/* Logo */}
            <Typography
              variant="h5"
              component="a"
              href="#"
              sx={{
                fontWeight: 600,
                color: 'text.primary',
                textDecoration: 'none',
                fontFamily: '"Cormorant Garamond", serif',
                fontSize: '1.8rem',
                letterSpacing: '0.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Clay & Fern
            </Typography>

            {/* Desktop Navigation Links */}
            {!isMobile && (
              <Box sx={{ display: 'flex', gap: '32px' }}>
                {['Curated Boxes', 'Create Custom Box', 'Artisanal Collection', 'Our Story'].map((link) => (
                  <Typography
                    key={link}
                    component="a"
                    href={`#${link.toLowerCase().replace(/ /g, '-')}`}
                    sx={{
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      color: 'text.primary',
                      textDecoration: 'none',
                      transition: 'color 0.2s',
                      position: 'relative',
                      padding: '4px 0',
                      '&:after': {
                        content: '""',
                        position: 'absolute',
                        width: '0',
                        height: '1px',
                        bottom: 0,
                        left: 0,
                        backgroundColor: 'primary.main',
                        transition: 'width 0.3s ease',
                      },
                      '&:hover': {
                        color: 'primary.main',
                      },
                      '&:hover:after': {
                        width: '100%',
                      },
                    }}
                  >
                    {link}
                  </Typography>
                ))}
              </Box>
            )}

            {/* Icons */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconButton color="inherit" aria-label="Search" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                <SearchOutlined />
              </IconButton>
              <IconButton color="inherit" aria-label="Favorites" sx={{ display: { xs: 'none', sm: 'inline-flex' } }}>
                <FavoriteBorderOutlined />
              </IconButton>
              <IconButton color="inherit" aria-label="Cart" onClick={handleAddToCart}>
                <Badge badgeContent={cartCount} color="primary" sx={{ '& .MuiBadge-badge': { borderRadius: '50%' } }}>
                  <ShoppingBagOutlined />
                </Badge>
              </IconButton>
              {isMobile && (
                <IconButton
                  color="inherit"
                  aria-label="menu"
                  onClick={() => setMobileMenuOpen(true)}
                  edge="end"
                >
                  <MenuOutlined />
                </IconButton>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer Navigation */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        slotProps={{
          paper: {
            sx: { width: '80%', maxWidth: '360px', bgcolor: 'background.default', p: 3 }
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Clay & Fern</Typography>
          <IconButton onClick={() => setMobileMenuOpen(false)}>
            <CloseOutlined />
          </IconButton>
        </Box>
        <List>
          {['Curated Boxes', 'Create Custom Box', 'Artisanal Collection', 'Our Story'].map((text) => (
            <ListItem disablePadding key={text}>
              <ListItemButton
                component="a"
                href={`#${text.toLowerCase().replace(/ /g, '-')}`}
                onClick={() => setMobileMenuOpen(false)}
                sx={{ py: 2 }}
              >
                <ListItemText
                  primary={text}
                  slotProps={{
                    primary: {
                      sx: { fontSize: '1.1rem', fontWeight: 500, color: 'text.primary' }
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 3 }} />
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 'auto' }}>
          <IconButton color="secondary"><Instagram /></IconButton>
          <IconButton color="secondary"><Facebook /></IconButton>
          <IconButton color="secondary"><Pinterest /></IconButton>
        </Box>
      </Drawer>

      {/* 3. HERO SECTION */}
      <Box
        sx={{
          minHeight: 'calc(100vh - 120px)',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          bgcolor: 'background.default',
          pt: { xs: 4, md: 8 },
          pb: { xs: 6, md: 10 },
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} sx={{ alignItems: 'center' }}>
            {/* Hero Left Content */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography
                  variant="overline"
                  sx={{
                    color: 'primary.main',
                    letterSpacing: '3px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    fontSize: '0.85rem',
                    display: 'block',
                    mb: 2,
                  }}
                >
                  Conscious Artisanal Gifting
                </Typography>
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.2rem' },
                    lineHeight: 1.15,
                    color: 'text.primary',
                    mb: 3,
                  }}
                >
                  Gifts that feel like a warm embrace.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: { xs: '1rem', sm: '1.1rem' },
                    color: 'text.secondary',
                    maxWidth: '480px',
                    mb: 5,
                    mx: { xs: 'auto', md: 0 },
                  }}
                >
                  Indulge in our collection of curated gift boxes filled with slow-made ceramics, clean body care, and botanical goods. Crafted sustainably to build meaningful connections.
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    justifyContent: { xs: 'center', md: 'flex-start' },
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    href="#curated-boxes"
                    sx={{
                      '&:hover': {
                        bgcolor: '#8f5740',
                        boxShadow: '0 4px 12px rgba(169, 111, 86, 0.2)',
                      },
                    }}
                  >
                    Shop Curated Boxes
                  </Button>
                  <Button
                    variant="outlined"
                    color="secondary"
                    href="#create-custom-box"
                    sx={{
                      borderColor: 'secondary.main',
                      color: 'secondary.main',
                      '&:hover': {
                        borderColor: 'secondary.main',
                        bgcolor: 'rgba(92, 107, 94, 0.08)',
                      },
                    }}
                  >
                    Design a Custom Box
                  </Button>
                </Box>
              </Box>
            </Grid>

            {/* Hero Right Image */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: { xs: '320px', sm: '450px', md: '520px' },
                  border: '1px solid #E4E0D9',
                  p: '12px',
                  bgcolor: 'background.paper',
                }}
              >
                <Box
                  component="img"
                  src="/hero_gifting.jpg"
                  alt="Aesthetic artisanal gift box"
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.8s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
                  }}
                />
                {/* Embedded decorative label */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: '24px',
                    left: '24px',
                    bgcolor: 'background.default',
                    border: '1px solid #E4E0D9',
                    py: 1.5,
                    px: 3,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <Typography variant="caption" sx={{ letterSpacing: '1px', textTransform: 'uppercase', color: 'primary.main', fontWeight: 600 }}>
                    Featured
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', fontFamily: '"Cormorant Garamond", serif', fontSize: '1.1rem' }}>
                    The Rituals Collection
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 4. VALUE & ETHOS SECTION */}
      <Box sx={{ py: 10, bgcolor: 'background.paper', borderTop: '1px solid #E4E0D9', borderBottom: '1px solid #E4E0D9' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ px: 2, textAlign: 'center' }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  <SpaOutlined sx={{ fontSize: '2.5rem' }} />
                </Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 500, fontSize: '1.4rem' }}>
                  Artisanal & Small Batch
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We partner directly with independent studio ceramicists, candle pourers, and organic apothecary creators who pour love and slow intent into every object.
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ px: 2, textAlign: 'center' }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  <LocalFloristOutlined sx={{ fontSize: '2.5rem' }} />
                </Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 500, fontSize: '1.4rem' }}>
                  Mindfully Packaged
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Every gift box is made of 100% recycled fibers, nested with wood wool padding, and tied with organic raw linen ribbon. Clean, compostable, and plastic-free.
                </Typography>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ px: 2, textAlign: 'center' }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  <LocalShippingOutlined sx={{ fontSize: '2.5rem' }} />
                </Box>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 500, fontSize: '1.4rem' }}>
                  Personalized Touch
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We hand-write your custom message in calligraphic script on seeded cards that grow wildflowers when planted. The ultimate touch of authentic care.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 5. CURATED COLLECTIONS GRID */}
      <Box id="curated-boxes" sx={{ py: 12, bgcolor: 'background.default' }}>
        <Container maxWidth="lg">
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="overline"
              sx={{ color: 'primary.main', letterSpacing: '3px', fontWeight: 600, display: 'block', mb: 1 }}
            >
              Ready To Send
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', sm: '2.8rem' }, color: 'text.primary' }}>
              The Curated Collection
            </Typography>
            <Box sx={{ width: '60px', height: '1px', bgcolor: 'primary.main', mx: 'auto', mt: 3 }} />
          </Box>

          {/* Cards Grid */}
          <Grid container spacing={4}>
            {curatedBoxes.map((box) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={box.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'background.paper',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      borderColor: 'primary.main',
                      '& .card-action-btn': {
                        bgcolor: 'primary.main',
                        color: 'background.default',
                      },
                      '& .card-image': {
                        transform: 'scale(1.04)',
                      },
                    },
                  }}
                >
                  {/* Card Media Wrapper for zoom effect */}
                  <Box sx={{ overflow: 'hidden', position: 'relative', pt: '80%' }}>
                    <CardMedia
                      className="card-image"
                      component="img"
                      image={box.image}
                      alt={box.title}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                      }}
                    />
                    <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 1 }}>
                      {box.tags.map(tag => (
                        <Box
                          key={tag}
                          sx={{
                            bgcolor: 'rgba(247, 245, 240, 0.95)',
                            color: 'text.primary',
                            border: '1px solid #E4E0D9',
                            px: 1.5,
                            py: 0.5,
                            fontSize: '0.7rem',
                            letterSpacing: '1px',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                          }}
                        >
                          {tag}
                        </Box>
                      ))}
                    </Box>
                  </Box>

                  {/* Card Content */}
                  <CardContent sx={{ p: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h5" sx={{ fontSize: '1.4rem', fontWeight: 500 }}>
                        {box.title}
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        {box.price}
                      </Typography>
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: 'secondary.main',
                        letterSpacing: '1px',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        display: 'block',
                        mb: 2,
                      }}
                    >
                      {box.subtitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1 }}>
                      {box.description}
                    </Typography>

                    {/* Action Button */}
                    <Button
                      className="card-action-btn"
                      variant="outlined"
                      fullWidth
                      onClick={handleAddToCart}
                      sx={{
                        borderColor: '#E4E0D9',
                        color: 'text.primary',
                        py: 1.5,
                        '&:hover': {
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      Add to Basket
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 6. "BUILD YOUR OWN" STEP-BY-STEP WIDGET */}
      <Box id="create-custom-box" sx={{ py: 12, bgcolor: 'background.paper', borderTop: '1px solid #E4E0D9', borderBottom: '1px solid #E4E0D9' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} sx={{ alignItems: 'center' }}>
            {/* Left side: Interactive Widget */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  border: '1px solid #E4E0D9',
                  p: { xs: 3, md: 5 },
                  bgcolor: 'background.default',
                }}
              >
                <Typography variant="h4" sx={{ mb: 1, fontSize: '1.8rem', fontWeight: 500 }}>
                  Box Customizer
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                  Create an organic gifting experience in three quick steps.
                </Typography>

                {/* Steps Headers */}
                <Box sx={{ display: 'flex', borderBottom: '1px solid #E4E0D9', pb: 1, mb: 4, gap: 3 }}>
                  {['01 Box Size', '02 Add Goods', '03 Add Note'].map((step, idx) => (
                    <Box
                      key={step}
                      onClick={() => activeStep >= idx && setActiveStep(idx)}
                      sx={{
                        cursor: activeStep >= idx ? 'pointer' : 'default',
                        pb: 1,
                        borderBottom: activeStep === idx ? '2px solid #A96F56' : 'none',
                        color: activeStep === idx ? 'primary.main' : activeStep > idx ? 'text.primary' : 'text.disabled',
                        fontWeight: activeStep === idx ? 600 : 500,
                        fontSize: '0.85rem',
                        transition: 'all 0.3s',
                      }}
                    >
                      {step}
                    </Box>
                  ))}
                </Box>

                {/* Step 1: Select Box Size */}
                <Collapse in={activeStep === 0}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Select Box Size</Typography>
                    <Grid container spacing={2}>
                      {[
                        { name: 'Classic Kraft Box', desc: 'Fits 3-4 items', price: '$12.00' },
                        { name: 'Grand Keepsake Box', desc: 'Fits 5-8 items', price: '$18.00' },
                      ].map((size) => (
                        <Grid size={{ xs: 6 }} key={size.name}>
                          <Box
                            onClick={() => setSelectedBoxSize(size.name)}
                            sx={{
                              border: '1px solid',
                              borderColor: selectedBoxSize === size.name ? 'primary.main' : '#E4E0D9',
                              bgcolor: selectedBoxSize === size.name ? 'rgba(169, 111, 86, 0.04)' : 'background.paper',
                              p: 2.5,
                              textAlign: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': { borderColor: 'primary.main' },
                            }}
                          >
                            <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem', mb: 0.5 }}>{size.name}</Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>{size.desc}</Typography>
                            <Typography variant="subtitle2" color="primary.main" sx={{ fontWeight: 600 }}>{size.price}</Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                    <Button
                      variant="contained"
                      fullWidth
                      disabled={!selectedBoxSize}
                      onClick={() => setActiveStep(1)}
                      sx={{ mt: 4 }}
                    >
                      Next: Choose Items
                    </Button>
                  </Box>
                </Collapse>

                {/* Step 2: Add Goods */}
                <Collapse in={activeStep === 1}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>Choose Organic Goods</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      {[
                        { name: 'Ceramic Tea Tumbler', price: '$28' },
                        { name: 'Soy Wax Sandalwood Candle', price: '$22' },
                        { name: 'Linen Herbal Eye Pillow', price: '$18' },
                        { name: 'Botanical Body Polish', price: '$24' },
                      ].map((item) => {
                        const selected = selectedItems.includes(item.name);
                        return (
                          <Box
                            key={item.name}
                            onClick={() => handleToggleItem(item.name)}
                            sx={{
                              border: '1px solid',
                              borderColor: selected ? 'primary.main' : '#E4E0D9',
                              bgcolor: selected ? 'rgba(169, 111, 86, 0.04)' : 'background.paper',
                              p: 2,
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              '&:hover': { borderColor: 'primary.main' },
                            }}
                          >
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{item.name}</Typography>
                            <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>{item.price}</Typography>
                          </Box>
                        );
                      })}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                      <Button variant="outlined" color="secondary" fullWidth onClick={() => setActiveStep(0)}>
                        Back
                      </Button>
                      <Button variant="contained" fullWidth onClick={() => setActiveStep(2)}>
                        Next: Add Note
                      </Button>
                    </Box>
                  </Box>
                </Collapse>

                {/* Step 3: Add Note */}
                <Collapse in={activeStep === 2}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Enter Greeting Card Message</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      We write your message by hand using fountain ink on botanical seeded cards.
                    </Typography>
                    <TextField
                      multiline
                      rows={4}
                      fullWidth
                      placeholder="Write your heartfelt note here..."
                      variant="outlined"
                      slotProps={{
                        input: {
                          sx: { bgcolor: 'background.paper', borderRadius: 0 },
                        }
                      }}
                      sx={{ '& .MuiOutlinedInput-root': { '& fieldset': { borderColor: '#E4E0D9' } } }}
                    />
                    <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
                      <Button variant="outlined" color="secondary" fullWidth onClick={() => setActiveStep(1)}>
                        Back
                      </Button>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => {
                          handleAddToCart();
                          handleResetBuilder();
                        }}
                      >
                        Add Custom Box to Cart
                      </Button>
                    </Box>
                  </Box>
                </Collapse>
              </Box>
            </Grid>

            {/* Right side: Informational Ethos */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ pl: { md: 4 } }}>
                <Typography
                  variant="overline"
                  sx={{ color: 'primary.main', letterSpacing: '3px', fontWeight: 600, display: 'block', mb: 1 }}
                >
                  Create Your Own
                </Typography>
                <Typography variant="h2" sx={{ fontSize: { xs: '2.2rem', sm: '2.8rem' }, color: 'text.primary', mb: 3 }}>
                  Tailored Gifting, Hand-Picked with Love
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                  Every recipient is unique. With our Custom Box Builder, you select the size, handpick the small-batch products, and choose a seeded message card. We bundle it with dried flora stems, wrap it securely in linen canvas ribbon, and ship it directly to their doorstep.
                </Typography>
                
                <Box sx={{ border: '1px solid #E4E0D9', p: '10px', mb: 4 }}>
                  <CardMedia
                    component="img"
                    image="/empty_box.jpg"
                    alt="Empty custom kraft box filler"
                    sx={{ width: '100%', height: '240px', objectFit: 'cover' }}
                  />
                </Box>

                <Box sx={{ display: 'flex', gap: 4 }}>
                  <Box>
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, mb: 0.5 }}>100%</Typography>
                    <Typography variant="caption" color="text.secondary">Artisanal Sourced</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, mb: 0.5 }}>Seeded</Typography>
                    <Typography variant="caption" color="text.secondary">Wildflower Paper</Typography>
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600, mb: 0.5 }}>Plastic-Free</Typography>
                    <Typography variant="caption" color="text.secondary">Sustainable Shipping</Typography>
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 7. CUSTOMER JOURNAL (TESTIMONIALS) */}
      <Box sx={{ py: 12, bgcolor: 'background.default', borderBottom: '1px solid #E4E0D9' }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography
              variant="overline"
              sx={{ color: 'primary.main', letterSpacing: '3px', fontWeight: 600, display: 'block', mb: 1 }}
            >
              Kind Words
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', sm: '2.5rem' }, color: 'text.primary' }}>
              The Gifting Journal
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((item, idx) => (
              <Grid size={{ xs: 12 }} key={idx}>
                <Box
                  sx={{
                    bgcolor: 'background.paper',
                    border: '1px solid #E4E0D9',
                    p: { xs: 4, md: 5 },
                    textAlign: 'center',
                    position: 'relative',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                    <Rating value={item.stars} readOnly precision={0.5} size="small" sx={{ color: 'primary.main' }} />
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: '1rem', md: '1.15rem' },
                      fontStyle: 'italic',
                      color: 'text.primary',
                      fontFamily: '"Cormorant Garamond", serif',
                      lineHeight: 1.6,
                      mb: 3,
                    }}
                  >
                    "{item.quote}"
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', display: 'inline' }}>
                    {item.author}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
                    — {item.role}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* 8. EDITORIAL JOURNAL TEASER */}
      <Box sx={{ py: 12, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="overline"
              sx={{ color: 'primary.main', letterSpacing: '3px', fontWeight: 600, display: 'block', mb: 1 }}
            >
              The Journal
            </Typography>
            <Typography variant="h2" sx={{ fontSize: { xs: '2rem', sm: '2.5rem' } }}>
              Stories of Slow Living
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  border: '1px solid #E4E0D9',
                  bgcolor: 'background.default',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    '& .journal-img': { transform: 'scale(1.03)' },
                  },
                }}
              >
                <Box sx={{ overflow: 'hidden', pt: '55%', position: 'relative' }}>
                  <Box
                    className="journal-img"
                    component="img"
                    src="/botanical_box.jpg"
                    alt="Dry wildflowers flatlay"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.6s ease',
                    }}
                  />
                </Box>
                <Box sx={{ p: 4 }}>
                  <Typography variant="caption" sx={{ color: 'primary.main', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>
                    Rituals • 5 Min Read
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1.5, mb: 2, fontSize: '1.6rem', fontWeight: 500 }}>
                    The Art of Slow Gifting: Making Intentional Connections
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    In a fast-paced world, sending a gift can easily become transactional. Discover how selecting small-batch, handmade objects turns gifting into a mindful ritual.
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Read Story <ArrowForwardOutlined sx={{ fontSize: '1rem' }} />
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  border: '1px solid #E4E0D9',
                  bgcolor: 'background.default',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    '& .journal-img': { transform: 'scale(1.03)' },
                  },
                }}
              >
                <Box sx={{ overflow: 'hidden', pt: '55%', position: 'relative' }}>
                  <Box
                    className="journal-img"
                    component="img"
                    src="/tea_box.jpg"
                    alt="Artisan ceramic styling"
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.6s ease',
                    }}
                  />
                </Box>
                <Box sx={{ p: 4 }}>
                  <Typography variant="caption" sx={{ color: 'primary.main', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 600 }}>
                    Behind the Maker • 8 Min Read
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 1.5, mb: 2, fontSize: '1.6rem', fontWeight: 500 }}>
                    Earth & Fire: The Clay Artists of the Coast
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Go behind the kiln with the clay artists crafting our signature ceramic tumblers. Discover the organic clay bodies and glazes sourced directly from ocean-side cliffs.
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Read Story <ArrowForwardOutlined sx={{ fontSize: '1rem' }} />
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* 9. NEWSLETTER SUBSCRIPTION */}
      <Box
        sx={{
          py: 10,
          bgcolor: '#EFECE5',
          borderTop: '1px solid #E4E0D9',
          borderBottom: '1px solid #E4E0D9',
          textAlign: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Typography
            variant="overline"
            sx={{ color: 'primary.main', letterSpacing: '3px', fontWeight: 600, display: 'block', mb: 1 }}
          >
            Stay Connected
          </Typography>
          <Typography variant="h2" sx={{ mb: 2, fontSize: { xs: '2rem', sm: '2.5rem' } }}>
            Subscribe to our Journal
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 5, maxWidth: '420px', mx: 'auto' }}>
            Receive stories of independent artists, tips on slow living, and get 10% off your first organic gift box.
          </Typography>

          <Box
            component="form"
            onSubmit={(e) => e.preventDefault()}
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 0,
              border: '1px solid #E4E0D9',
              bgcolor: 'background.paper',
              p: 0.5,
            }}
          >
            <TextField
              variant="standard"
              placeholder="Your email address"
              fullWidth
              slotProps={{
                input: {
                  disableUnderline: true,
                  sx: { px: 2, py: 1, fontSize: '0.95rem' },
                }
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{
                whiteSpace: 'nowrap',
                px: 4,
                py: { xs: 1.5, sm: 'auto' },
                borderRadius: 0,
              }}
            >
              Subscribe
            </Button>
          </Box>
        </Container>
      </Box>

      {/* 10. FOOTER */}
      <Box sx={{ py: 10, bgcolor: 'background.default', color: 'text.primary' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} sx={{ mb: 8 }}>
            {/* Column 1: Brand & Bio */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="h5" sx={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 600, fontSize: '1.6rem', mb: 3 }}>
                Clay & Fern
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4, maxWidth: '280px' }}>
                Thoughtfully curated, organic, and earth-conscious gift packages designed to strengthen bonds and support small independent makers.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <IconButton color="secondary" size="small"><Instagram /></IconButton>
                <IconButton color="secondary" size="small"><Facebook /></IconButton>
                <IconButton color="secondary" size="small"><Pinterest /></IconButton>
              </Box>
            </Grid>

            {/* Column 2: Shop Links */}
            <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 3, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Shop
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {['All Gift Boxes', 'Create Custom Box', 'Artisanal Ceramics', 'Slow Candles', 'Organic Linens', 'Corporate Orders'].map((link) => (
                  <Typography key={link} component="a" href="#" sx={{ fontSize: '0.85rem', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                    {link}
                  </Typography>
                ))}
              </Box>
            </Grid>

            {/* Column 3: Care & Info Links */}
            <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 3, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Our Care
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {['Sustainability Policy', 'Shipping & Delivery', 'Return Policy', 'Care Instructions', 'FAQ', 'Contact Us'].map((link) => (
                  <Typography key={link} component="a" href="#" sx={{ fontSize: '0.85rem', color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
                    {link}
                  </Typography>
                ))}
              </Box>
            </Grid>

            {/* Column 4: Brand Mission */}
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 3, textTransform: 'uppercase', letterSpacing: '1px' }}>
                Our Studio
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Nestled on the coast, we pack every parcel by hand with careful attention.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                hello@clayandfern.com
              </Typography>
              <Typography variant="body2" color="text.secondary">
                1-800-SLOW-GIFT
              </Typography>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 4 }} />

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              &copy; {new Date().getFullYear()} Clay & Fern Studio. All Rights Reserved.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Crafted consciously • Plant-based & Plastic-free
            </Typography>
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default Home;