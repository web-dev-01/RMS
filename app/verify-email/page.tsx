'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function VerifyEmailPage() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const router = useRouter();

  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('email');
    if (!storedEmail) {
      setError('Email not found. Please login again.');
      setTimeout(() => router.push('/login'), 3000);
    } else {
      setEmail(storedEmail);
    }
  }, [router]);

  const handleVerify = async () => {
    setError('');

    if (!code) {
      setError('Please enter the verification code.');
      return;
    }

    if (code.trim().length !== 4) {
      setError('Verification code must be 4 digits.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('/api/auth/verify-email', {
        email,
        code: code.trim(),
      });

      if (res.data.success) {
        localStorage.removeItem('email');
        setSnackbarOpen(true);

        setTimeout(() => {
          setSnackbarOpen(false);
          router.push('/login');
        }, 2000);
      } else {
        setError(res.data.message || 'Invalid verification code.');
      }
    } catch (err) {
      console.error('Verify API error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      height="100vh"
      sx={{ backgroundColor: '#0A0F19' }}
    >
      <Paper
        elevation={6}
        sx={{
          padding: 6,
          maxWidth: 500,
          width: '100%',
          borderRadius: 4,
          backgroundColor: '#0A0F19',
          color: '#fff',
          textAlign: 'center',
        }}
      >
        <Box display="flex" justifyContent="center" mb={3}>
          <Image src="/logo.png" alt="Logo" width={60} height={60} />
        </Box>

        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Enter Verification Code
        </Typography>

        <Typography variant="body2" mb={3}>
          A 4-digit code was sent to your email: <b>{email}</b>
          <br />
          Please enter it below to verify your account.
        </Typography>

        <TextField
          fullWidth
          variant="outlined"
          label="Verification Code"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (error) setError('');
          }}
          sx={{
            input: { color: '#fff' },
            label: { color: '#bbb' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': { borderColor: '#555' },
              '&:hover fieldset': { borderColor: '#00ED64' },
              '&.Mui-focused fieldset': { borderColor: '#00ED64' },
            },
            mb: 2,
          }}
        />

        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={handleVerify}
          disabled={loading}
          sx={{
            backgroundColor: '#00ED64',
            color: '#000',
            '&:hover': { backgroundColor: '#00c957' },
            mt: 1,
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify'}
        </Button>
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Email verified successfully!
        </Alert>
      </Snackbar>
    </Box>
  );
}
