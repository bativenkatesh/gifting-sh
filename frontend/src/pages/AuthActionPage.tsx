import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { Alert, Box, Button, CircularProgress, Container, TextField, Typography } from '@mui/material';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export function AuthActionPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const isVerification = location.pathname === '/verify-email';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(isVerification && Boolean(token));
  const [developmentToken, setDevelopmentToken] = useState('');

  useEffect(() => {
    if (!isVerification || !token) return;
    fetch(`${API_BASE_URL}/api/v1/auth/verify-email`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error?.message || 'Verification failed.');
        setNotice('Your email is verified. You can now sign in.');
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Verification failed.'))
      .finally(() => setBusy(false));
  }, [isVerification, token]);

  async function requestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/password-reset/request`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message || 'Could not request a reset.');
      setNotice(result.data.message);
      setDevelopmentToken(result.data.developmentToken || '');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not request a reset.');
    } finally { setBusy(false); }
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmation) { setError('Passwords do not match.'); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/password-reset/confirm`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message || 'Could not reset the password.');
      setNotice(result.data.message);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not reset the password.');
    } finally { setBusy(false); }
  }

  return (
    <Box sx={{ minHeight: '65vh', bgcolor: '#f6f3ed', py: { xs: 5, md: 8 } }}>
      <Container maxWidth="sm">
        <Typography variant="overline" sx={{ color: '#9a7a3e', letterSpacing: '.2em' }}>Sannidhi Collective</Typography>
        <Typography variant="h2" sx={{ fontFamily: '"Cormorant Garamond", Georgia, serif', mb: 3 }}>
          {isVerification ? 'Verify your email' : token ? 'Choose a new password' : 'Reset your password'}
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}
        {busy && isVerification ? <CircularProgress /> : isVerification ? null : token ? (
          <Box component="form" onSubmit={resetPassword} sx={{ display: 'grid', gap: 2 }}>
            <TextField required type="password" label="New password" autoComplete="new-password" slotProps={{ htmlInput: { minLength: 8 } }} value={password} onChange={(event) => setPassword(event.target.value)} />
            <TextField required type="password" label="Confirm password" autoComplete="new-password" slotProps={{ htmlInput: { minLength: 8 } }} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
            <Button type="submit" variant="contained" disabled={busy}>Update password</Button>
          </Box>
        ) : (
          <Box component="form" onSubmit={requestReset} sx={{ display: 'grid', gap: 2 }}>
            <Typography color="text.secondary">Enter the email on your account and we will send reset instructions.</Typography>
            <TextField required type="email" label="Email address" value={email} onChange={(event) => setEmail(event.target.value)} />
            <Button type="submit" variant="contained" disabled={busy}>{busy ? 'Sending…' : 'Send reset link'}</Button>
            {developmentToken && <Alert severity="info">Local development reset link: <Link to={`/reset-password?token=${encodeURIComponent(developmentToken)}`}>Continue to password reset</Link></Alert>}
          </Box>
        )}
        <Button component={Link} to="/login" sx={{ mt: 3 }}>Return to sign in</Button>
      </Container>
    </Box>
  );
}
