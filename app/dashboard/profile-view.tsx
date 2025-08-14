'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  Divider,
  Button,
  Grid,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Email as EmailIcon, Phone as PhoneIcon, Edit as EditIcon } from '@mui/icons-material';
import { useSearchParams, useRouter } from 'next/navigation';

const theme = {
  primaryColor: '#00ED64',
  secondaryColor: '#0A0F19',
  background: '#0A0F19',
  cardBackground: '#1e1e1e',
};

const StyledPaper = styled(Paper)(() => ({
  background: theme.cardBackground,
  borderRadius: 16,
  boxShadow: '0 10px 20px rgba(0, 0, 0, 0.7)',
  padding: 24,
  color: '#fff',
  maxWidth: 800,
  margin: 'auto',
}));

const InfoRow = styled(Box)(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  marginBottom: '12px',
}));

export default function ViewProfilePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailFromParams = searchParams.get('email') || ''; // from query

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<{
    email: string;
    fullName: string;
    phoneNumber: string;
    imageUrl: string;
  } | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      if (!emailFromParams) {
        setError('No email provided in URL');
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/user-profile?email=${encodeURIComponent(emailFromParams)}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.message || 'Failed to fetch profile');

        if (data.users && data.users.length > 0) {
          setProfile(data.users[0]);
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [emailFromParams]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.background,
        }}
      >
        <CircularProgress size={50} sx={{ color: theme.primaryColor }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: theme.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 2,
        }}
      >
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: 4,
        px: 2,
        backgroundColor: theme.background,
        color: '#fff',
      }}
    >
      <StyledPaper>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar
            src={profile?.imageUrl || ''}
            alt={profile?.fullName || 'Profile Picture'}
            sx={{
              width: 120,
              height: 120,
              margin: 'auto',
              border: `3px solid ${theme.primaryColor}`,
            }}
          />
          <Typography variant="h5" sx={{ fontWeight: 600, mt: 2 }}>
            {profile?.fullName || 'N/A'}
          </Typography>
          <Typography variant="body2" sx={{ color: '#bbb' }}>
            Profile Overview
          </Typography>
        </Box>

        <Divider sx={{ borderColor: '#444', my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <InfoRow>
              <EmailIcon sx={{ color: theme.primaryColor }} />
              <Typography variant="body1">{profile?.email}</Typography>
            </InfoRow>
          </Grid>
          <Grid item xs={12} md={6}>
            <InfoRow>
              <PhoneIcon sx={{ color: theme.primaryColor }} />
              <Typography variant="body1">{profile?.phoneNumber}</Typography>
            </InfoRow>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: '#444', my: 2 }} />

        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            sx={{
              background: theme.primaryColor,
              color: theme.secondaryColor,
              borderRadius: 8,
              fontWeight: 600,
              '&:hover': { background: '#00C653' },
            }}
            onClick={() =>
              router.push(`/profile/complete?email=${encodeURIComponent(profile?.email || '')}`)
            }
          >
            Edit Profile
          </Button>
        </Box>
      </StyledPaper>
    </Box>
  );
}
