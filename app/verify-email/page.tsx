'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  CircularProgress,
} from '@mui/material';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function VerifyEmailPage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleVerify = async () => {
    if (!code) {
      setError('Please enter the verification code.');
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post('/api/verify-email', { code });

      if (res.data.success) {
        router.push('/login');
      } else {
        setError(res.data.message || 'Invalid code.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Something went wrong.');
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
          A 6-digit code was sent to your email. Please enter it below to verify your account.
        </Typography>

        <TextField
          fullWidth
          variant="outlined"
          label="Verification Code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          sx={{
            input: { color: '#fff' },
            label: { color: '#bbb' },
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: '#555',
              },
              '&:hover fieldset': {
                borderColor: '#00ED64',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#00ED64',
              },
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
            '&:hover': {
              backgroundColor: '#00c957',
            },
            mt: 1,
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Verify'}
        </Button>
      </Paper>
    </Box>
  );
}
