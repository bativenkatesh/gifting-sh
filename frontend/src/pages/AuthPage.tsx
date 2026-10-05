import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, CircularProgress, Container, IconButton, InputAdornment,
  TextField, Typography,
} from '@mui/material';
import { ArrowBack, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

type AuthPageProps = { mode: 'login' | 'signup' };

export function AuthPage({ mode }: AuthPageProps) {
  const isSignup = mode === 'signup';
  const { user, token, login, signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    if (user && token) navigate('/catalog', { replace: true });
  }, [navigate, token, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage('');
    setInfoMessage('');
    if (isSignup && password !== confirmPassword) {
      setErrorMessage('Your passwords do not match.');
      return;
    }

    setSubmitting(true);
    const result = isSignup
      ? await signup(name.trim(), email.trim(), password)
      : await login(email.trim(), password);
    setSubmitting(false);

    if (!result.success) {
      setErrorMessage(result.message || (isSignup ? 'We could not create your account.' : 'We could not sign you in.'));
      return;
    }
    if ('verificationRequired' in result && result.verificationRequired) {
      setInfoMessage('Check your email for a verification link before signing in.');
      return;
    }
    navigate('/catalog', { replace: true });
  }

  return (
    <Box sx={{ minHeight: 'calc(100vh - 180px)', bgcolor: '#f6f3ed', py: { xs: 4, md: 7 }, display: 'grid', alignItems: 'center' }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, bgcolor: '#fffdf9', border: '1px solid rgba(184,151,88,.25)', boxShadow: '0 24px 70px rgba(38,32,24,.08)', minHeight: { md: 570 } }}>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'space-between', p: { md: 5, lg: 6 }, bgcolor: '#252a22', color: '#f6f2e9', backgroundImage: 'linear-gradient(160deg, rgba(37,42,34,.95), rgba(37,42,34,.82)), url(/hero_gifting.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <Box>
              <Box component="img" src="/logo.png" alt="Sannidhi Collective" sx={{ width: 48, height: 48, objectFit: 'contain', mb: 2 }} />
              <Typography variant="overline" sx={{ display: 'block', letterSpacing: '.24em', color: '#d2bd8e' }}>Sannidhi Collective</Typography>
            </Box>
            <Box>
              <Typography variant="h2" sx={{ fontFamily: 'Georgia, serif', fontSize: '3rem', lineHeight: 1.08, mb: 2 }}>
                A more considered way to give.
              </Typography>
              <Typography sx={{ color: 'rgba(246,242,233,.75)', lineHeight: 1.8 }}>
                Discover keepsake-worthy gifts, thoughtful details, and a collection curated for meaningful moments.
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ letterSpacing: '.16em', color: 'rgba(246,242,233,.56)' }}>THOUGHTFULLY CURATED · ALWAYS PERSONAL</Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', p: { xs: 3, sm: 5, lg: 6 } }}>
            <Button component={Link} to="/" startIcon={<ArrowBack />} sx={{ alignSelf: 'flex-start', mb: 3, color: '#6f6b61', textTransform: 'none' }}>
              Back to the store
            </Button>
            <Typography variant="overline" sx={{ color: '#9a7a3e', letterSpacing: '.2em' }}>Your private client account</Typography>
            <Typography variant="h3" sx={{ fontFamily: 'Georgia, serif', fontSize: { xs: '2.35rem', sm: '2.7rem' }, mb: 1 }}>
              {isSignup ? 'Create your account' : 'Welcome back'}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3.5, lineHeight: 1.7 }}>
              {isSignup ? 'Join us to save your details and make every gift personal.' : 'Sign in to continue exploring our curated collection.'}
            </Typography>

            {errorMessage && <Alert severity="error" sx={{ mb: 2.5 }}>{errorMessage}</Alert>}
            {infoMessage && <Alert severity="info" sx={{ mb: 2.5 }}>{infoMessage}</Alert>}

            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ display: 'grid', gap: 2 }}>
              {isSignup && <TextField
                label="Full name" autoComplete="name" required fullWidth value={name}
                onChange={(event) => setName(event.target.value)} slotProps={{ htmlInput: { maxLength: 120 } }}
              />}
              <TextField
                label="Email address" type="email" autoComplete="email" required fullWidth value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <TextField
                label="Password" type={showPassword ? 'text' : 'password'} autoComplete={isSignup ? 'new-password' : 'current-password'}
                required fullWidth value={password} onChange={(event) => setPassword(event.target.value)}
                helperText={isSignup ? 'Use at least 8 characters.' : undefined}
                slotProps={{ input: { endAdornment: <InputAdornment position="end"><IconButton aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((visible) => !visible)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> } }}
              />
              {isSignup && <TextField
                label="Confirm password" type={showPassword ? 'text' : 'password'} autoComplete="new-password" required fullWidth
                value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)}
              />}
              <Button type="submit" variant="contained" disabled={submitting} sx={{ mt: 1, py: 1.5, borderRadius: 0, bgcolor: '#252a22', '&:hover': { bgcolor: '#41483b' } }}>
                {submitting ? <CircularProgress size={22} color="inherit" /> : isSignup ? 'Create account' : 'Sign in'}
              </Button>
            </Box>

            {!isSignup && <Button component={Link} to="/reset-password" sx={{ alignSelf: 'flex-end', mt: 1, color: '#8b6b32', textTransform: 'none' }}>Forgot password?</Button>}

            <Typography variant="body2" sx={{ mt: 3, color: '#69665f', textAlign: 'center' }}>
              {isSignup ? 'Already have an account?' : 'New to Sannidhi Collective?'}{' '}
              <Button component={Link} to={isSignup ? '/login' : '/signup'} sx={{ p: 0, minWidth: 0, color: '#8b6b32', textTransform: 'none', fontWeight: 700 }}>
                {isSignup ? 'Sign in' : 'Create an account'}
              </Button>
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 3, textAlign: 'center', lineHeight: 1.6 }}>
              By continuing, you agree to use your account responsibly. Your password is securely hashed and never returned by the service.
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
