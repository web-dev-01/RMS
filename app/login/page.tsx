'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  InputAdornment,
  IconButton,
  CircularProgress,
  Link,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { usePortalTheme } from '@/components/ThemeProvider';

export default function LoginPage() {
  const router = useRouter();
  const theme = usePortalTheme?.();
  const primaryColor = theme?.primaryColor || '#00C291';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setCheckingToken(false);
        return;
      }

      try {
        const res = await axios.get('/api/auth/verify-token', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const user = res.data?.user;
        if (user?.isProfileComplete) {
          router.push('/dashboard');
        } else {
          router.push('/auth/profile-completion');
        }
      } catch (err) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setCheckingToken(false);
      }
    };

    checkToken();
  }, [router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogin = async () => {
    const { email, password } = formData;

    if (!email || !password) {
      setErrorMsg('Please fill in both email and password');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await axios.post('/api/auth/login', formData);
      const { token, user } = res.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Redirect conditionally
      if (user?.isProfileComplete) {
        router.push('/dashboard');
      } else {
        router.push('/profile-completion');
      }

    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'Invalid credentials. Please try again.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <Grid
        container
        justifyContent="center"
        alignItems="center"
        sx={{ minHeight: '100vh', backgroundColor: '#0A0F19' }}
      >
        <CircularProgress sx={{ color: primaryColor }} />
      </Grid>
    );
  }

  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0A0F19',
        backgroundImage: `radial-gradient(circle at top left, ${primaryColor}11, transparent 60%)`,
        px: 2,
      }}
    >
      <Grid item xs={12} sm={10} md={5} lg={4}>
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            backgroundColor: 'background.paper',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          }}
        >
          <Box display="flex" justifyContent="center" mb={3}>
            <Image src="/logo.png" alt="RMS Logo" width={60} height={60} />
          </Box>

          <Typography
            variant="h4"
            fontWeight="bold"
            textAlign="center"
            color={primaryColor}
            mb={1}
          >
            Welcome Back
          </Typography>

          <Typography
            variant="body2"
            textAlign="center"
            color="text.secondary"
            mb={3}
          >
            Enter your login credentials below
          </Typography>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
          >
            <TextField
              fullWidth
              name="email"
              label="Email Address"
              variant="outlined"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              type="email"
            />

            <TextField
              fullWidth
              name="password"
              label="Password"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {errorMsg && (
              <Typography
                color="error"
                fontSize={14}
                textAlign="center"
                mt={1}
                mb={2}
              >
                {errorMsg}
              </Typography>
            )}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                mt: 2,
                py: 1.3,
                fontWeight: 'bold',
                fontSize: '16px',
                borderRadius: 2,
                backgroundColor: primaryColor,
                '&:hover': {
                  backgroundColor: primaryColor + 'cc',
                },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: 'white' }} /> : 'Login'}
            </Button>
          </form>

          <Box display="flex" justifyContent="space-between" mt={2}>
            <Link
              href="/forgot-password"
              underline="hover"
              sx={{
                fontSize: 14,
                color: primaryColor,
                fontWeight: 500,
              }}
            >
              Forgot password?
            </Link>

            <Link
              href="/signup"
              underline="hover"
              sx={{
                fontSize: 14,
                color: primaryColor,
                fontWeight: 500,
              }}
            >
              Don&apos;t have an account?
            </Link>
          </Box>

          <Box mt={4} textAlign="center">
            <Typography variant="caption" color="text.secondary">
              © {new Date().getFullYear()} IPIS-RMS — Railway Management System
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}
