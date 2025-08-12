'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Avatar, CircularProgress } from '@mui/material';
import Cookies from 'js-cookie';

interface UserProfile {
  fullName: string;
  phoneNumber: string;
  image: string | null;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = Cookies.get('email');
    if (!email) {
      // Redirect to login or handle no email
      setLoading(false);
      return;
    }

    fetch(`/api/user-profile?email=${email}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setProfile({
            fullName: data.fullName,
            phoneNumber: data.phoneNumber,
            image: data.image,
          });
        }
      })
      .catch(() => {
        // Handle error
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;

  if (!profile) return <Typography>No profile found</Typography>;

  return (
    <Box sx={{ p: 4, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Your Profile
      </Typography>
      <Avatar
        src={profile.image || undefined}
        sx={{ width: 100, height: 100, mb: 2 }}
      />
      <Typography variant="h6">Name: {profile.fullName}</Typography>
      <Typography variant="body1">Phone: {profile.phoneNumber}</Typography>
    </Box>
  );
}
