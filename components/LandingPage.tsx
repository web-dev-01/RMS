'use client';

import React from 'react';
import { Box } from '@mui/material';
import LandingBody from '@/components/LandingBody';
import Footer from '@/components/Footer'; // agar footer alag bana hai

export default function LandingPage() {
  return (
    <Box
      component="main"
      sx={{
        bgcolor: 'background.default',
        color: 'text.primary',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
      }}
    >
      <LandingBody />
      <Footer />
    </Box>
  );
}
