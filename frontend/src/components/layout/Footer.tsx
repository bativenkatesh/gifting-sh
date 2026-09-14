import React, { useState } from 'react';
import { Container, Grid, Box, Typography, TextField, Button, Divider, IconButton } from '@mui/material';
import { Instagram, Facebook, Pinterest, ArrowForward } from '@mui/icons-material';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#161413',
        color: '#FAF8F5',
        pt: { xs: 8, md: 12 },
        pb: 6,
        borderTop: '1px solid rgba(184, 151, 88, 0.35)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Watermark Crest */}
      <Box
        component="img"
        src="/logo.png"
        alt=""
        sx={{
          position: 'absolute',
          right: '-5%',
          bottom: '-10%',
          width: { xs: 260, md: 480 },
          opacity: 0.03,
          pointerEvents: 'none',
          filter: 'invert(1)',
        }}
      />

      <Container maxWidth="xl">
        <Grid container spacing={{ xs: 5, md: 8 }}>
          {/* Col 1: Brand & Philosophy */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
              <Box
                component="img"
                src="/logo.png"
                alt="Maison Lotus Crest"
                sx={{
                  height: 48,
                  width: 'auto',
                  filter: 'drop-shadow(0 2px 8px rgba(184, 151, 88, 0.3))',
                }}
              />
              <Box>
                <Typography
                  variant="h5"
                  sx={{
                    fontFamily: '"Cormorant Garamond", Georgia, serif',
                    letterSpacing: '0.2em',
                    fontSize: '1.4rem',
                    textTransform: 'uppercase',
                    color: '#FAF8F5',
                  }}
                >
                  Sannidhi Collective
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: '"Cinzel", serif',
                    color: '#B89758',
                    letterSpacing: '0.25em',
                    fontSize: '0.65rem',
                    display: 'block',
                  }}
                >
                  Haute Curations & Gifting
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="body2"
              sx={{
                color: '#A8A29E',
                fontFamily: '"Plus Jakarta Sans", sans-serif',
                lineHeight: 1.8,
                maxWidth: 360,
                fontSize: '0.88rem',
                mb: 3,
              }}
            >
              Curating rare sentiments and heirloom keepsakes for discerning individuals. Hand-tied ribbons, 
              bespoke calligraphed correspondence, and hand-poured golden wax seals since 1892.
            </Typography>

            <Box sx={{ display: 'flex', gap: 1.5 }}>
              {[
                { icon: <Instagram fontSize="small" />, label: 'Instagram' },
                { icon: <Pinterest fontSize="small" />, label: 'Pinterest' },
                { icon: <Facebook fontSize="small" />, label: 'Facebook' },
              ].map((item) => (
                <IconButton
                  key={item.label}
                  aria-label={item.label}
                  sx={{
                    color: '#B89758',
                    border: '1px solid rgba(184, 151, 88, 0.25)',
                    borderRadius: 0,
                    p: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(184, 151, 88, 0.1)',
                      borderColor: '#B89758',
                    },
                  }}
                >
                  {item.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Col 2: Ateliers & Boutiques */}
          <Grid size={{ xs: 6, md: 2.5 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: '"Cinzel", serif',
                letterSpacing: '0.2em',
                color: '#B89758',
                mb: 2.5,
                fontSize: '0.75rem',
              }}
            >
              Private Ateliers
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                { city: 'London', address: '24 New Bond Street, Mayfair' },
                { city: 'New York', address: '740 Madison Avenue, UES' },
                { city: 'Paris', address: '18 Place Vendôme, 1er' },
                { city: 'Zurich', address: '42 Bahnhofstrasse' },
              ].map((loc) => (
                <Box key={loc.city} sx={{ mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#FAF8F5', fontWeight: 600, fontSize: '0.85rem' }}>
                    {loc.city}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#78716C', display: 'block', fontSize: '0.75rem' }}>
                    {loc.address}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Grid>

          {/* Col 3: Services & Client Care */}
          <Grid size={{ xs: 6, md: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: '"Cinzel", serif',
                letterSpacing: '0.2em',
                color: '#B89758',
                mb: 2.5,
                fontSize: '0.75rem',
              }}
            >
              Private Services
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2 }}>
              {[
                'Bespoke Corporate Gifts',
                'Private Family Emblems',
                'White-Glove Courier',
                'Heirloom Provenance',
                'Estate Registry',
                'Client Concierge',
              ].map((item) => (
                <Typography
                  key={item}
                  variant="body2"
                  sx={{
                    color: '#A8A29E',
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    transition: 'color 0.2s',
                    '&:hover': { color: '#B89758' },
                  }}
                >
                  {item}
                </Typography>
              ))}
            </Box>
          </Grid>

          {/* Col 4: Newsletter & Private Gazette */}
          <Grid size={{ xs: 12, md: 3.5 }}>
            <Typography
              variant="subtitle2"
              sx={{
                fontFamily: '"Cinzel", serif',
                letterSpacing: '0.2em',
                color: '#B89758',
                mb: 1.5,
                fontSize: '0.75rem',
              }}
            >
              The Maison Gazette
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#A8A29E',
                fontSize: '0.82rem',
                lineHeight: 1.7,
                mb: 2.5,
              }}
            >
              Invitations to limited botanical vintages, seasonal tea harvests, and private estate releases.
            </Typography>

            {subscribed ? (
              <Box
                sx={{
                  p: 2,
                  border: '1px solid #B89758',
                  backgroundColor: 'rgba(184, 151, 88, 0.08)',
                }}
              >
                <Typography variant="body2" sx={{ color: '#FAF8F5', fontFamily: '"Cormorant Garamond", serif', fontSize: '1rem' }}>
                  We are honored to count you among our private correspondents.
                </Typography>
              </Box>
            ) : (
              <Box component="form" onSubmit={handleSubscribe} sx={{ display: 'flex' }}>
                <TextField
                  placeholder="Your preferred email"
                  variant="outlined"
                  size="small"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  fullWidth
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 0,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: '#FAF8F5',
                      fontSize: '0.85rem',
                      '& fieldset': {
                        borderColor: 'rgba(184, 151, 88, 0.3)',
                      },
                      '&:hover fieldset': {
                        borderColor: '#B89758',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#B89758',
                      },
                    },
                    '& .MuiInputBase-input::placeholder': {
                      color: '#78716C',
                      opacity: 1,
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  sx={{
                    backgroundColor: '#B89758',
                    color: '#161413',
                    minWidth: 'auto',
                    px: 2.5,
                    border: '1px solid #B89758',
                    '&:hover': {
                      backgroundColor: '#D4B87D',
                      borderColor: '#D4B87D',
                    },
                  }}
                >
                  <ArrowForward fontSize="small" />
                </Button>
              </Box>
            )}
          </Grid>
        </Grid>

        <Divider sx={{ my: 6, borderColor: 'rgba(184, 151, 88, 0.2)' }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: '#78716C',
              fontFamily: '"Plus Jakarta Sans", sans-serif',
              fontSize: '0.75rem',
            }}
          >
            © {new Date().getFullYear()} SANNIDHI COLLECTIVE. ALL RIGHTS RESERVED.
          </Typography>

          <Box sx={{ display: 'flex', gap: 3 }}>
            {['Privacy Policy', 'Heirloom Guarantee', 'Courier Terms', 'Private Concierge'].map((term) => (
              <Typography
                key={term}
                variant="caption"
                sx={{
                  color: '#78716C',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  '&:hover': { color: '#B89758' },
                }}
              >
                {term}
              </Typography>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
