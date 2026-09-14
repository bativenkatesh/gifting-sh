import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  IconButton,
  Badge,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  Menu,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  ShoppingBagOutlined,
  PersonOutlined,
  MenuOutlined,
  CloseOutlined,
  CheckCircleOutlined,
} from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar: React.FC = () => {
  const { totalItems, openCart } = useCart();
  const { user, logout, openAuthModal } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountAnchor, setAccountAnchor] = useState<null | HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 70);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Curated Catalog', path: '/catalog' },
    { label: 'Bespoke Builder', path: '/#builder' },
    { label: 'Cart & Calligraphy', path: '/cart' },
  ];

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    if (path.startsWith('/#')) {
      if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
          const el = document.getElementById(path.replace('/#', ''));
          el?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        const el = document.getElementById(path.replace('/#', ''));
        el?.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(path);
    }
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <Box
        sx={{
          backgroundColor: '#1C1917',
          color: '#FAF8F5',
          py: 0.9,
          textAlign: 'center',
          fontSize: '0.72rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontFamily: '"Cinzel", serif',
          borderBottom: '1px solid rgba(184, 151, 88, 0.3)',
        }}
      >
        Complimentary White-Glove Courier & Hand-Poured Wax Seal on All Heirloom Curations
      </Box>

      {/* Main Luxury Navigation */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: 'rgba(250, 248, 245, 0.96)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(184, 151, 88, 0.25)',
          color: '#1C1917',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: { xs: 74, md: 88 }, justifyContent: 'space-between' }}>
            {/* Left: Mobile Menu Toggle / Desktop Links */}
            <Box sx={{ display: 'flex', alignItems: 'center', flex: { md: 1 } }}>
              {isMobile ? (
                <IconButton
                  onClick={() => setMobileMenuOpen(true)}
                  aria-label="Open menu"
                  sx={{ color: '#1C1917', p: 1 }}
                >
                  <MenuOutlined />
                </IconButton>
              ) : (
                <Box sx={{ display: 'flex', gap: 3.5, alignItems: 'center' }}>
                  {navLinks.slice(0, 3).map((link) => (
                    <Button
                      key={link.label}
                      onClick={() => handleNavClick(link.path)}
                      sx={{
                        color: location.pathname === link.path ? '#B89758' : '#1C1917',
                        fontFamily: '"Cinzel", serif',
                        fontSize: '0.78rem',
                        letterSpacing: '0.14em',
                        fontWeight: 500,
                        padding: '6px 0',
                        minWidth: 'auto',
                        borderBottom: location.pathname === link.path ? '1px solid #B89758' : '1px solid transparent',
                        '&:hover': {
                          color: '#B89758',
                          backgroundColor: 'transparent',
                        },
                      }}
                    >
                      {link.label}
                    </Button>
                  ))}
                </Box>
              )}
            </Box>

            {/* Center: Brand Lotus Logo & Monogram */}
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textDecoration: 'none',
                color: '#1C1917',
                py: 1,
                opacity: location.pathname === '/' ? (isScrolled ? 1 : 0) : 1,
                transform: location.pathname === '/' ? (isScrolled ? 'translateY(0)' : 'translateY(-6px)') : 'none',
                pointerEvents: location.pathname === '/' ? (isScrolled ? 'auto' : 'none') : 'auto',
                transition: 'opacity 0.4s ease, transform 0.4s ease',
              }}
            >
              <Box
                component="img"
                src="/logo.png"
                alt="Sannidhi Collective Crest"
                sx={{
                  height: { xs: 38, md: 46 },
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 6px rgba(184, 151, 88, 0.25))',
                  transition: 'transform 0.4s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: { xs: '1.25rem', md: '1.45rem' },
                  letterSpacing: '0.22em',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  color: '#1C1917',
                  mt: 0.3,
                  lineHeight: 1,
                }}
              >
                Sannidhi Collective
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontFamily: '"Cinzel", serif',
                  fontSize: '0.55rem',
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: '#8C6D34',
                  mt: 0.2,
                }}
              >
                Haute Curations • Est. 1892
              </Typography>
            </Box>

            {/* Right: Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: { xs: 1, md: 2 }, flex: { md: 1 } }}>
              {!isMobile && (
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Cinzel", serif',
                    letterSpacing: '0.15em',
                    fontSize: '0.72rem',
                    color: '#78716C',
                    mr: 1,
                    display: { xs: 'none', lg: 'block' },
                  }}
                >
                  USD ($)
                </Typography>
              )}

              {/* Account Button */}
              {user ? (
                <>
                  <Button
                    onClick={(e) => setAccountAnchor(e.currentTarget)}
                    startIcon={<CheckCircleOutlined sx={{ fontSize: '1rem', color: '#B89758' }} />}
                    sx={{
                      color: '#1C1917',
                      fontFamily: '"Cinzel", serif',
                      fontSize: '0.75rem',
                      letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      px: 1.5,
                      py: 0.5,
                      display: { xs: 'none', sm: 'flex' },
                    }}
                  >
                    {user.name.split(' ')[0]}
                  </Button>
                  <Menu
                    anchorEl={accountAnchor}
                    open={Boolean(accountAnchor)}
                    onClose={() => setAccountAnchor(null)}
                    slotProps={{
                      paper: {
                        sx: {
                          borderRadius: 0,
                          border: '1px solid rgba(184, 151, 88, 0.3)',
                          backgroundColor: '#FAF8F5',
                          minWidth: 180,
                          boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                        },
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5 }}>
                      <Typography variant="caption" sx={{ color: '#78716C', display: 'block' }}>
                        Signed in as
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {user.name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#78716C', fontSize: '0.7rem' }}>
                        {user.email}
                      </Typography>
                    </Box>
                    <ListItemButton
                      onClick={() => {
                        setAccountAnchor(null);
                        logout();
                      }}
                      sx={{ py: 1 }}
                    >
                      <Typography
                        sx={{
                          fontFamily: '"Cinzel", serif',
                          fontSize: '0.75rem',
                          letterSpacing: '0.1em',
                          color: '#C98A90',
                        }}
                      >
                        Sign Out
                      </Typography>
                    </ListItemButton>
                  </Menu>
                </>
              ) : (
                <IconButton
                  onClick={openAuthModal}
                  aria-label="Atelier Membership"
                  sx={{ color: '#1C1917', p: 1 }}
                >
                  <PersonOutlined />
                </IconButton>
              )}

              {/* Cart Drawer Button */}
              <IconButton
                onClick={openCart}
                aria-label="Open Cart"
                sx={{
                  color: '#1C1917',
                  p: 1,
                  position: 'relative',
                  '&:hover': {
                    color: '#B89758',
                  },
                }}
              >
                <Badge
                  badgeContent={totalItems}
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: '#B89758',
                      color: '#FFFFFF',
                      fontFamily: '"Plus Jakarta Sans", sans-serif',
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      minWidth: 18,
                      height: 18,
                      borderRadius: '9px',
                    },
                  }}
                >
                  <ShoppingBagOutlined sx={{ fontSize: '1.45rem' }} />
                </Badge>
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer Navigation */}
      <Drawer
        anchor="left"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: 300,
              backgroundColor: '#FAF8F5',
              borderRight: '1px solid rgba(184, 151, 88, 0.25)',
              p: 3,
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box component="img" src="/logo.png" alt="Logo" sx={{ width: 28, height: 'auto' }} />
            <Typography variant="h6" sx={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.2rem', fontWeight: 600 }}>
              SANNIDHI COLLECTIVE
            </Typography>
          </Box>
          <IconButton onClick={() => setMobileMenuOpen(false)}>
            <CloseOutlined />
          </IconButton>
        </Box>

        <List sx={{ mt: 2 }}>
          {navLinks.map((link) => (
            <ListItem key={link.label} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavClick(link.path)}
                sx={{
                  py: 1.5,
                  borderBottom: '1px solid rgba(184, 151, 88, 0.12)',
                }}
              >
                <Typography
                  sx={{
                    fontFamily: '"Cinzel", serif',
                    fontSize: '0.85rem',
                    letterSpacing: '0.12em',
                    color: '#1C1917',
                  }}
                >
                  {link.label}
                </Typography>
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ mt: 6, pt: 3, borderTop: '1px solid rgba(184, 151, 88, 0.25)' }}>
          {user ? (
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>{user.name}</Typography>
              <Typography variant="caption" sx={{ color: '#78716C' }}>{user.email}</Typography>
              <Button
                fullWidth
                variant="outlined"
                onClick={logout}
                sx={{ mt: 2, borderColor: '#C98A90', color: '#C98A90' }}
              >
                Sign Out
              </Button>
            </Box>
          ) : (
            <Button
              fullWidth
              variant="contained"
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal();
              }}
            >
              Sign In to Atelier
            </Button>
          )}
        </Box>
      </Drawer>
    </>
  );
};
