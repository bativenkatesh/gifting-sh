import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { luxuryTheme } from './theme';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { HomePage } from './pages/HomePage';
import { CatalogPage } from './pages/CatalogPage';
import { CartPage } from './pages/CartPage';
import { AdminPortal } from './pages/AdminPortal';
import { AuthPage } from './pages/AuthPage';

function StoreApp() {
  return (
    <CartProvider>
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FAF8F5' }}>
          <Navbar />
          <Box component="main" sx={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<AuthPage mode="login" />} />
              <Route path="/signup" element={<AuthPage mode="signup" />} />
            </Routes>
          </Box>
          <Footer />
          <CartDrawer />
        </Box>
      </Router>
    </CartProvider>
  );
}

function App() {
  const isAdminHost = /^admin\./i.test(window.location.hostname);

  return (
    <ThemeProvider theme={luxuryTheme}>
      <CssBaseline />
      <AuthProvider>
        {isAdminHost ? <AdminPortal /> : <StoreApp />}
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
