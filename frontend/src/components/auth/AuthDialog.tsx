import React, { useState } from 'react';
import {
  Dialog,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
} from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

export const AuthDialog: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, signup } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleTabChange = (_: React.SyntheticEvent, newValue: 'login' | 'signup') => {
    setActiveTab(newValue);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (activeTab === 'login') {
      const res = await login(email, password);
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.message || 'Login failed');
      }
    } else {
      if (!name.trim()) {
        setLoading(false);
        setErrorMsg('Please enter your full name');
        return;
      }
      if (password.length < 8) {
        setLoading(false);
        setErrorMsg('Password must be at least 8 characters');
        return;
      }

      const res = await signup(name, email, password);
      setLoading(false);
      if (!res.success) {
        setErrorMsg(res.message || 'Registration failed');
      } else {
        setSuccessMsg('Account created successfully.');
      }
    }
  };

  return (
    <Dialog
      open={isAuthModalOpen}
      onClose={closeAuthModal}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            borderRadius: 0,
            backgroundColor: '#FAF8F5',
            border: '1px solid rgba(184, 151, 88, 0.35)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
            p: { xs: 2.5, sm: 4 },
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <IconButton onClick={closeAuthModal} size="small" sx={{ color: '#78716C' }}>
          <CloseOutlined fontSize="small" />
        </IconButton>
      </Box>

      {/* Brand Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box
          component="img"
          src="/logo.png"
          alt="Maison Lotus"
          sx={{ width: 48, height: 'auto', mb: 1.5, mx: 'auto', filter: 'drop-shadow(0 2px 6px rgba(184,151,88,0.25))' }}
        />
        <Typography
          variant="h5"
          sx={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            letterSpacing: '0.15em',
            fontSize: '1.5rem',
            textTransform: 'uppercase',
            color: '#1C1917',
          }}
        >
          Sannidhi Collective Atelier
        </Typography>
        <Typography
          variant="caption"
          sx={{
            fontFamily: '"Cinzel", serif',
            letterSpacing: '0.2em',
            fontSize: '0.65rem',
            color: '#B89758',
            display: 'block',
          }}
        >
          Private Client Sanctuary
        </Typography>
      </Box>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        centered
        sx={{
          mb: 3,
          '& .MuiTabs-indicator': {
            backgroundColor: '#B89758',
            height: '2px',
          },
        }}
      >
        <Tab
          value="login"
          label="Sign In"
          sx={{
            fontFamily: '"Cinzel", serif',
            fontSize: '0.78rem',
            letterSpacing: '0.12em',
            color: '#78716C',
            '&.Mui-selected': { color: '#1C1917', fontWeight: 600 },
          }}
        />
        <Tab
          value="signup"
          label="Join Atelier"
          sx={{
            fontFamily: '"Cinzel", serif',
            fontSize: '0.78rem',
            letterSpacing: '0.12em',
            color: '#78716C',
            '&.Mui-selected': { color: '#1C1917', fontWeight: 600 },
          }}
        />
      </Tabs>

      {errorMsg && (
        <Alert
          severity="error"
          sx={{
            mb: 2.5,
            borderRadius: 0,
            fontSize: '0.82rem',
            backgroundColor: 'rgba(201, 138, 144, 0.15)',
            color: '#9E5E65',
            border: '1px solid rgba(201, 138, 144, 0.4)',
          }}
        >
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert
          severity="success"
          sx={{
            mb: 2.5,
            borderRadius: 0,
            fontSize: '0.82rem',
            backgroundColor: 'rgba(184, 151, 88, 0.1)',
            color: '#8C6D34',
            border: '1px solid rgba(184, 151, 88, 0.4)',
          }}
        >
          {successMsg}
        </Alert>
      )}

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {activeTab === 'signup' && (
          <TextField
            label="Full Title & Name"
            placeholder="e.g. Lady Victoria Sterling"
            variant="outlined"
            fullWidth
            required
            size="small"
            value={name}
            onChange={(e) => setName(e.target.value)}
            slotProps={{
              inputLabel: { sx: { fontSize: '0.82rem', fontFamily: '"Cinzel", serif' } },
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 0,
                backgroundColor: '#FFFFFF',
                '& fieldset': { borderColor: 'rgba(184, 151, 88, 0.25)' },
              },
            }}
          />
        )}

        <TextField
          label="Email Address"
          type="email"
          placeholder="client@sanctuary.com"
          variant="outlined"
          fullWidth
          required
          size="small"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          slotProps={{
            inputLabel: { sx: { fontSize: '0.82rem', fontFamily: '"Cinzel", serif' } },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 0,
              backgroundColor: '#FFFFFF',
              '& fieldset': { borderColor: 'rgba(184, 151, 88, 0.25)' },
            },
          }}
        />

        <TextField
          label="Password"
          type="password"
          placeholder="••••••••••••"
          variant="outlined"
          fullWidth
          required
          size="small"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          helperText={activeTab === 'signup' ? 'Minimum 8 characters' : undefined}
          slotProps={{
            inputLabel: { sx: { fontSize: '0.82rem', fontFamily: '"Cinzel", serif' } },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 0,
              backgroundColor: '#FFFFFF',
              '& fieldset': { borderColor: 'rgba(184, 151, 88, 0.25)' },
            },
          }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            mt: 1.5,
            py: 1.4,
            backgroundColor: '#1C1917',
            color: '#FAF8F5',
            '&:hover': {
              backgroundColor: '#B89758',
            },
          }}
        >
          {loading ? (
            <CircularProgress size={20} sx={{ color: '#FAF8F5' }} />
          ) : activeTab === 'login' ? (
            'Access Atelier'
          ) : (
            'Create Private Account'
          )}
        </Button>
      </Box>
    </Dialog>
  );
};
