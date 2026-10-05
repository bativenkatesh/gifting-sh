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
import { OrdersPage } from './pages/OrdersPage';
import { WishlistPage } from './pages/WishlistPage';
import { AddressesPage } from './pages/AddressesPage';
import { StorePolicyPage } from './pages/StorePolicyPage';
import { AuthActionPage } from './pages/AuthActionPage';
import { StoreSettingsProvider } from './context/StoreSettingsContext';

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
              <Route path="/verify-email" element={<AuthActionPage />} />
              <Route path="/reset-password" element={<AuthActionPage />} />
              <Route path="/account/orders" element={<OrdersPage />} />
              <Route path="/account/orders/:orderId" element={<OrdersPage />} />
              <Route path="/account/wishlist" element={<WishlistPage />} />
              <Route path="/account/addresses" element={<AddressesPage />} />
              <Route path="/policies/:policy" element={<StorePolicyPage />} />
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
        <StoreSettingsProvider>
          {isAdminHost ? <AdminPortal /> : <StoreApp />}
        </StoreSettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
