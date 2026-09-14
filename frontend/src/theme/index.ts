import { createTheme } from '@mui/material/styles';

export const luxuryTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#B89758', // Antique Gilded Gold
      light: '#D4B87D',
      dark: '#8C6D34',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#C98A90', // Dusty Heritage Rose
      light: '#E8C5C8',
      dark: '#9E5E65',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FAF8F5', // Alabaster Parchment
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1C1917', // Deep Espresso Charcoal
      secondary: '#78716C', // Warm Stone Gray
    },
    divider: 'rgba(184, 151, 88, 0.22)',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      fontWeight: 500,
      letterSpacing: '-0.02em',
      lineHeight: 1.15,
    },
    h2: {
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      fontWeight: 500,
      letterSpacing: '-0.01em',
      lineHeight: 1.2,
    },
    h3: {
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      fontWeight: 500,
      letterSpacing: '-0.01em',
      lineHeight: 1.25,
    },
    h4: {
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      fontWeight: 500,
      letterSpacing: '0',
    },
    h5: {
      fontFamily: '"Cormorant Garamond", Georgia, serif',
      fontWeight: 600,
    },
    h6: {
      fontFamily: '"Cinzel", Georgia, serif',
      fontWeight: 500,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      fontSize: '0.9rem',
    },
    subtitle1: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      letterSpacing: '0.02em',
      lineHeight: 1.6,
    },
    subtitle2: {
      fontFamily: '"Cinzel", serif',
      letterSpacing: '0.15em',
      textTransform: 'uppercase',
      fontSize: '0.75rem',
      fontWeight: 600,
    },
    body1: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      lineHeight: 1.7,
      fontSize: '0.95rem',
    },
    body2: {
      fontFamily: '"Plus Jakarta Sans", sans-serif',
      lineHeight: 1.6,
      fontSize: '0.85rem',
    },
    button: {
      fontFamily: '"Cinzel", serif',
      letterSpacing: '0.14em',
      fontWeight: 600,
      textTransform: 'uppercase',
      fontSize: '0.8rem',
    },
  },
  shape: {
    borderRadius: 0, // Clean, architectural straight edges for quiet luxury
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          padding: '12px 28px',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        contained: {
          backgroundColor: '#1C1917',
          color: '#FAF8F5',
          border: '1px solid #1C1917',
          '&:hover': {
            backgroundColor: '#B89758',
            borderColor: '#B89758',
            color: '#FFFFFF',
          },
        },
        outlined: {
          borderColor: '#B89758',
          color: '#1C1917',
          '&:hover': {
            borderColor: '#8C6D34',
            backgroundColor: 'rgba(184, 151, 88, 0.06)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: 'none',
          border: '1px solid rgba(184, 151, 88, 0.18)',
          backgroundColor: '#FFFFFF',
          transition: 'all 0.35s ease',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(184, 151, 88, 0.2)',
        },
      },
    },
  },
});
