import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Box, Button, Container, IconButton, Stack, TextField, Typography } from '@mui/material';
import { DeleteOutlined } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
type Address = { id: string; fullName: string; addressLine1: string; city: string; state: string; postalCode: string; country: string };
const emptyAddress = { fullName: '', addressLine1: '', city: '', state: '', postalCode: '', country: '' };

export function AddressesPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [address, setAddress] = useState(emptyAddress);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!user || !token) { navigate('/login', { replace: true }); return; }
    fetch(`${API_BASE_URL}/api/v1/account/addresses`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) throw new Error(result.error?.message || 'Could not load saved addresses.');
        setAddresses(result.data.addresses);
      })
      .catch((requestError) => setError(requestError instanceof Error ? requestError.message : 'Could not load saved addresses.'));
  }, [navigate, token, user]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!token) return;
    setBusy(true); setError(''); setNotice('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/account/addresses`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ address }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error?.message || 'Could not save this address.');
      setAddresses(result.data.addresses); setAddress(emptyAddress); setNotice('Address saved.');
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not save this address.');
    } finally { setBusy(false); }
  }

  async function remove(addressId: string) {
    if (!token) return;
    const response = await fetch(`${API_BASE_URL}/api/v1/account/addresses/${encodeURIComponent(addressId)}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();
    if (response.ok && result.success) setAddresses(result.data.addresses);
  }

  return (
    <Box sx={{ minHeight: '70vh', bgcolor: '#FAF8F5', py: { xs: 5, md: 8 } }}>
      <Container maxWidth="md">
        <Typography variant="overline" sx={{ color: '#9a7a3e', letterSpacing: '.2em' }}>Client account</Typography>
        <Typography variant="h2" sx={{ fontFamily: '"Cormorant Garamond", Georgia, serif', mb: 3 }}>Delivery addresses</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {notice && <Alert severity="success" sx={{ mb: 2 }}>{notice}</Alert>}
        <Stack spacing={1} sx={{ mb: 4 }}>
          {addresses.map((entry) => <Stack key={entry.id} direction="row" sx={{ borderBottom: '1px solid rgba(184,151,88,.25)', py: 2, alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}><Typography sx={{ fontWeight: 700 }}>{entry.fullName}</Typography><Typography variant="body2" color="text.secondary">{[entry.addressLine1, entry.city, entry.state, entry.postalCode, entry.country].filter(Boolean).join(', ')}</Typography></Box>
            <IconButton aria-label="Remove address" onClick={() => void remove(entry.id)}><DeleteOutlined /></IconButton>
          </Stack>)}
        </Stack>
        <Box component="form" onSubmit={save} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <Typography variant="h5" sx={{ gridColumn: '1 / -1', fontFamily: '"Cormorant Garamond", Georgia, serif' }}>Add an address</Typography>
          <TextField label="Recipient name" required value={address.fullName} onChange={(event) => setAddress({ ...address, fullName: event.target.value })} />
          <TextField label="Address" required value={address.addressLine1} onChange={(event) => setAddress({ ...address, addressLine1: event.target.value })} />
          <TextField label="City" required value={address.city} onChange={(event) => setAddress({ ...address, city: event.target.value })} />
          <TextField label="State / region" value={address.state} onChange={(event) => setAddress({ ...address, state: event.target.value })} />
          <TextField label="Postal code" required value={address.postalCode} onChange={(event) => setAddress({ ...address, postalCode: event.target.value })} />
          <TextField label="Country" required value={address.country} onChange={(event) => setAddress({ ...address, country: event.target.value })} />
          <Button type="submit" variant="contained" disabled={busy} sx={{ gridColumn: '1 / -1', justifySelf: 'end' }}>Save address</Button>
        </Box>
        <Button component={Link} to="/account/orders" sx={{ mt: 3 }}>Back to account</Button>
      </Container>
    </Box>
  );
}
