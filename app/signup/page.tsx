'use client';

import {
  Box,
  Button,
  Container,
  CssBaseline,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  Link,
  Snackbar,
  Alert,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Snackbar state
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setSnackbarMsg("Passwords do not match");
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post('/api/auth/register', formData);

      // Show success snackbar
      setSnackbarMsg(response.data.message || 'Registration successful');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // Save email for verification page
      localStorage.setItem('email', formData.email);

      // Redirect after 2.5 seconds
      setTimeout(() => {
        setSnackbarOpen(false);
        router.push('/verify-email');
      }, 2500);
    } catch (error: any) {
      setSnackbarMsg(error?.response?.data?.message || 'Something went wrong');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <CssBaseline />
      <Paper elevation={5} sx={{ padding: 5, mt: 8, borderRadius: 3 }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Image src="/logo.png" alt="Logo" width={60} height={60} />
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Create an Account
          </Typography>

          <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: '1rem' }}>
            <TextField
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              type="email"
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              type={showPassword ? 'text' : 'password'}
              fullWidth
              margin="normal"
              required
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 2, py: 1.5 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>
          </form>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mt: 2 }}>
            <Link href="/login" variant="body2">
              Already have an account? Login
            </Link>
          </Box>
        </Box>
      </Paper>

      {/* Snackbar for messages */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMsg}
        </Alert>
      </Snackbar>
    </Container>
  );
}