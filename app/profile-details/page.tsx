'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Paper,
} from '@mui/material';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface UserProfile {
  fullName: string;
  email: string;
  phoneNumber: string;
  image?: string | null;
}

export default function ProfileDetailsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const email = Cookies.get('email');
      if (!email) {
        router.push('/login');
        return;
      }

      try {
        const res = await fetch(`/api/user-profile?email=${encodeURIComponent(email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setProfile({
              fullName: data.fullName,
              email,
              phoneNumber: data.phoneNumber,
              image: data.image || null,
            });
          } else {
            // No profile found - redirect to complete profile
            router.push('/profile-completion');
          }
        } else {
          router.push('/login');
        }
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#121212',
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (!profile) {
    return null; // or some fallback UI
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#121212',
        color: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: 3,
      }}
    >
      <Paper
        elevation={10}
        sx={{
          p: 4,
          borderRadius: 3,
          maxWidth: 400,
          width: '100%',
          bgcolor: '#1e1e1e',
          textAlign: 'center',
        }}
      >
        <Avatar
          src={profile.image || undefined}
          sx={{ width: 100, height: 100, mx: 'auto', mb: 2, bgcolor: '#00D4B8', fontSize: 48 }}
        >
          {!profile.image && profile.fullName.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h5" fontWeight="bold" mb={1}>
          {profile.fullName}
        </Typography>
        <Typography variant="body1" mb={0.5}>
          Email: {profile.email}
        </Typography>
        <Typography variant="body1">
          Phone: {profile.phoneNumber}
        </Typography>
      </Paper>
    </Box>
  );
}
