'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Snackbar,
  Alert,
  IconButton,
  InputAdornment,
  Link,
} from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const ForgotPasswordPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setSnackbar({ open: true, message: 'Email is required', severity: 'error' });
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post('/api/forgot-password', { email });
      setSnackbar({
        open: true,
        message: response?.data?.message || 'Password reset email sent!',
        severity: 'success',
      });
      setEmail('');
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.message || 'Something went wrong',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#0A0F19',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 4,
          borderRadius: '20px',
          background: '#ffffff0a',
          backdropFilter: 'blur(12px)',
          color: '#fff',
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Image src="/logo.png" alt="Logo" width={60} height={60} />
          <Typography variant="h5" fontWeight="bold" mt={2}>
            Forgot Password
          </Typography>
          <Typography variant="body2" color="#cfcfcf" mt={1}>
            Enter your email to reset your password
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            placeholder="Enter your email"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ color: '#00ED64' }} />
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
              '& .MuiOutlinedInput-root': {
                color: '#fff',
                '& fieldset': { borderColor: '#00ED64' },
                '&:hover fieldset': { borderColor: '#00ED64' },
                '&.Mui-focused fieldset': { borderColor: '#00ED64' },
              },
              '& input::placeholder': {
                color: '#cccccc',
              },
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 1,
              mb: 2,
              backgroundColor: '#00ED64',
              color: '#0A0F19',
              fontWeight: 'bold',
              borderRadius: '10px',
              '&:hover': {
                backgroundColor: '#00c755',
              },
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
          </Button>
        </form>

        <Grid container justifyContent="space-between" alignItems="center" mt={3}>
          <Grid item>
            <Link
              onClick={() => router.push('/login')}
              underline="hover"
              sx={{ color: '#00ED64', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              <ArrowBackIosNewIcon fontSize="small" sx={{ mr: 0.5 }} />
              Back to Login
            </Link>
          </Grid>
        </Grid>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity as any} onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ForgotPasswordPage;
