'use client';

import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Stack,
  IconButton,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
} from '@mui/icons-material';
import { usePortalTheme } from '@/components/ThemeProvider';

export default function Footer() {
  const theme = usePortalTheme();
  const textGreen = theme.primaryColor || '#006400';

  return (
    <Box
      component="footer"
      sx={{
        py: 8,
        bgcolor: textGreen + '11',
        borderTop: `2px solid ${textGreen}`,
        userSelect: 'none',
        mt: 12,
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
              sx={{ color: textGreen }}
            >
              {theme.brandWord || 'IP-IPIS RMS'}
            </Typography>
            <Typography
              variant="body2"
              sx={{ lineHeight: 1.6, color: textGreen }}
            >
              RMS for IP based Integrated Passenger Information System.<br />
              A smart solution for real-time transit monitoring, efficiency, and connectivity.
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
              sx={{ color: textGreen }}
            >
              Connect with Us
            </Typography>
            <Stack direction="row" spacing={2} mt={1}>
              {[Facebook, Twitter, Instagram, LinkedIn].map((Icon, i) => (
                <IconButton
                  key={i}
                  sx={{
                    color: textGreen,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.15)',
                      opacity: 0.8,
                    },
                  }}
                >
                  <Icon />
                </IconButton>
              ))}
            </Stack>
          </Grid>
        </Grid>

        {/* Divider */}
        <Box mt={{ xs: 5, md: 7 }} textAlign="center">
          <Typography
            variant="body2"
            fontWeight={500}
            sx={{ color: textGreen }}
          >
            RMS for IP based Integrated Passenger Information System
          </Typography>
          <Typography
            variant="body2"
            fontWeight={600}
            mt={1}
            sx={{ color: textGreen }}
          >
            © 2025 TIC Kolkata | All Rights Reserved
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
