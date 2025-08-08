'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControlLabel,
  TextField,
  Typography,
  Alert,
  Paper,
} from '@mui/material';

export default function SettingsPage(): JSX.Element {
  const [formData, setFormData] = useState({
    apiEndpoint: '',
    apiKey: '',
    username: '',
    password: '',
    autoDelete: false,
    railtelDataSync: false,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch('/api/rms/setting');
        const data = await res.json();
        setFormData(prev => ({ ...prev, ...data }));
      } catch (err) {
        console.error('Error loading settings', err);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/rms/setting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await res.json();
      setMessage(result.message || 'Settings updated.');
    } catch (err) {
      console.error('Save error', err);
      setMessage('Error updating settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Portal Settings
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Configure system-level parameters for the Railway Management Portal.
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="API Endpoint"
            name="apiEndpoint"
            value={formData.apiEndpoint}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="API Key"
            name="apiKey"
            value={formData.apiKey}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
          />

          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
          />

          <FormControlLabel
            control={
              <Checkbox
                name="autoDelete"
                checked={formData.autoDelete}
                onChange={handleChange}
              />
            }
            label="Enable Auto Delete"
          />

          <FormControlLabel
            control={
              <Checkbox
                name="railtelDataSync"
                checked={formData.railtelDataSync}
                onChange={handleChange}
              />
            }
            label="Enable Railtel Data Sync"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Settings'}
          </Button>

          {message && (
            <Alert severity={message.includes('Error') ? 'error' : 'success'}>
              {message}
            </Alert>
          )}
        </Box>
      </Paper>
    </Container>
  );
}
