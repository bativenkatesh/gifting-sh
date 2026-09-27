import { useState, type FormEvent } from 'react';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { AdminWorkspace } from './AdminWorkspace';

export function AdminPortal() {
  const { user, token, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setErrorMessage(result.message || 'Sign in failed. Check your email and password.');
      return;
    }
    if (result.user?.role !== 'admin') {
      logout();
      setErrorMessage('This account does not have administrator access.');
    }
  }

  if (user?.role === 'admin' && token) return <AdminWorkspace />;

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.1fr .9fr' }, bgcolor: '#f5f3ee' }}>
      <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between', p: { md: 8, lg: 12 }, bgcolor: '#252a22', color: '#f6f2e9' }}>
        <Typography variant="overline" sx={{ letterSpacing: '.25em', color: '#c7ad76' }}>Sannidhi Collective</Typography>
        <Box>
          <Typography variant="h1" sx={{ maxWidth: 640, fontFamily: 'Georgia, serif', fontSize: 'clamp(3rem, 5.5vw, 5.8rem)', lineHeight: 1.05 }}>
            Thoughtful gifts. Carefully managed.
          </Typography>
          <Typography sx={{ mt: 3, maxWidth: 460, color: 'rgba(246,242,233,.72)', lineHeight: 1.8 }}>
            The private workspace for orders and store operations.
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ letterSpacing: '.12em', color: 'rgba(246,242,233,.55)' }}>ADMINISTRATOR ACCESS</Typography>
      </Box>

      <Box sx={{ display: 'grid', placeItems: 'center', p: { xs: 3, sm: 6 } }}>
        <Box sx={{ width: '100%', maxWidth: 420 }}>
          <Typography variant="overline" sx={{ letterSpacing: '.22em', color: '#8b7443' }}>Private workspace</Typography>
          <Typography variant="h3" sx={{ fontFamily: 'Georgia, serif', mb: 1 }}>Admin sign in</Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>Use your administrator account to continue.</Typography>

          {errorMessage && <Alert severity="error" sx={{ mb: 3 }}>{errorMessage}</Alert>}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'grid', gap: 2.5 }}>
            <TextField label="Email address" type="email" autoComplete="username" required fullWidth value={email} onChange={(event) => setEmail(event.target.value)} />
            <TextField label="Password" type="password" autoComplete="current-password" required fullWidth value={password} onChange={(event) => setPassword(event.target.value)} />
            <Button type="submit" variant="contained" disabled={loading} sx={{ mt: 1, py: 1.5, borderRadius: 0, bgcolor: '#252a22', '&:hover': { bgcolor: '#41483b' } }}>
              {loading ? <CircularProgress size={22} color="inherit" /> : 'Sign in securely'}
            </Button>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 4, lineHeight: 1.7 }}>
            Administrator access is restricted to accounts assigned the admin role. Customer registration does not grant access to this workspace.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
