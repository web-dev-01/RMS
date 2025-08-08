'use client';

import React from 'react';
import { 
  Box, Button, Container, Typography, Stack, Grid, Divider, SvgIcon 
} from '@mui/material';
import { CheckCircle, Build, Security, Speed, Train, NetworkCheck, Analytics } from '@mui/icons-material';

// Helper Icon wrappers for consistent size and color
const FeatureIcon = ({ icon }: { icon: React.ReactNode }) => (
  <SvgIcon sx={{ fontSize: 48, color: '#00ED64' }}>{icon}</SvgIcon>
);

export default function LandingBody() {
  const theme = {
    primaryColor: '#00ED64',
    secondaryColor: '#000',
    heading: 'Advanced Railway Management System for',
    brandWord: 'IPIPS',
    cta1: 'Get Started',
    cta2: 'Learn More'
  };

  return (
    <Box
      component="main"
      sx={{
        bgcolor: 'background.default',
        color: 'text.primary',
        minHeight: '100vh',
        py: { xs: 8, md: 12 },
        px: { xs: 3, sm: 6, md: 12 },
        userSelect: 'none',
        backgroundImage: `radial-gradient(circle at top left, ${theme.primaryColor}22, transparent 70%)`,
      }}
    >
      {/* Header with Logo */}
      <Container maxWidth="lg" sx={{ mb: 4, textAlign: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 4 }}>
          <img 
            src="logo.png" 
            alt="RMS Logo" 
            style={{ 
              height: '80px', 
              width: 'auto',
              marginRight: '16px'
            }} 
          />
          <Typography
            variant="h5"
            fontWeight={600}
            sx={{
              fontFamily: "'Inter', sans-serif",
              color: 'text.primary'
            }}
          >
            Railway Management System
          </Typography>
        </Box>
      </Container>

      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ mb: 12, textAlign: 'center' }}>
        <Typography
          variant="h2"
          component="h1"
          fontWeight={800}
          gutterBottom
          sx={{
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            fontFamily: "'Poppins', sans-serif",
            fontSize: { xs: '2.5rem', md: '3.5rem' }
          }}
        >
          {theme.heading}{' '}
          <Box
            component="span"
            sx={{
              color: theme.primaryColor,
              backgroundImage: `linear-gradient(90deg, ${theme.primaryColor}cc, ${theme.primaryColor}ee)`,
              px: 1.5,
              borderRadius: 1,
              userSelect: 'text',
            }}
          >
            {theme.brandWord}
          </Box>
        </Typography>

        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ 
            mb: 6, 
            fontWeight: 500, 
            fontFamily: "'Inter', sans-serif", 
            maxWidth: 700, 
            mx: 'auto',
            fontSize: { xs: '1.1rem', md: '1.25rem' }
          }}
        >
          Comprehensive IP-based Integrated Passenger Information System designed for modern railway operations, 
          providing real-time information management and seamless passenger experience.
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={3}
          justifyContent="center"
          alignItems="center"
        >
          <Button
            variant="contained"
            size="large"
            sx={{
              fontWeight: 700,
              borderRadius: 3,
              px: 6,
              py: 1.5,
              bgcolor: theme.primaryColor,
              color: theme.secondaryColor || '#000',
              '&:hover': {
                bgcolor: theme.primaryColor + 'cc',
                boxShadow: `0 0 12px 4px ${theme.primaryColor}`,
              },
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            {theme.cta1}
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{
              fontWeight: 700,
              borderRadius: 3,
              px: 6,
              py: 1.5,
              borderColor: theme.primaryColor,
              color: theme.primaryColor,
              '&:hover': {
                bgcolor: theme.primaryColor + '11',
                borderColor: theme.primaryColor,
                color: theme.primaryColor,
              },
              textTransform: 'none',
              fontSize: '1.1rem'
            }}
          >
            {theme.cta2}
          </Button>
        </Stack>
      </Container>

      <Divider sx={{ borderColor: '#00ED64aa', mb: 10, maxWidth: 800, mx: 'auto' }} />

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 14 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          align="center"
          gutterBottom
          sx={{ mb: 6, fontFamily: "'Poppins', sans-serif" }}
        >
          Key Features of {theme.brandWord}
        </Typography>

        <Grid container spacing={6} justifyContent="center">
          {/* Feature 1 */}
          <Grid item xs={12} md={4} textAlign="center">
            <FeatureIcon icon={<Train />} />
            <Typography variant="h6" fontWeight={600} mt={3} mb={1}>
              Real-time Train Information
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={300} mx="auto">
              Live updates on train schedules, delays, platform changes, and arrival/departure times for enhanced passenger experience.
            </Typography>
          </Grid>

          {/* Feature 2 */}
          <Grid item xs={12} md={4} textAlign="center">
            <FeatureIcon icon={<NetworkCheck />} />
            <Typography variant="h6" fontWeight={600} mt={3} mb={1}>
              IP-based Integration
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={300} mx="auto">
              Seamless integration across multiple platforms using IP-based communication for reliable and scalable operations.
            </Typography>
          </Grid>

          {/* Feature 3 */}
          <Grid item xs={12} md={4} textAlign="center">
            <FeatureIcon icon={<Analytics />} />
            <Typography variant="h6" fontWeight={600} mt={3} mb={1}>
              Advanced Analytics
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={300} mx="auto">
              Comprehensive reporting and analytics to optimize railway operations and improve passenger satisfaction.
            </Typography>
          </Grid>
        </Grid>
      </Container>

      {/* System Capabilities Section */}
      <Container maxWidth="lg" sx={{ mb: 14 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          align="center"
          gutterBottom
          sx={{ mb: 6, fontFamily: "'Poppins', sans-serif" }}
        >
          Additional System Capabilities
        </Typography>

        <Grid container spacing={6} justifyContent="center">
          {/* Feature 4 */}
          <Grid item xs={12} md={4} textAlign="center">
            <FeatureIcon icon={<Security />} />
            <Typography variant="h6" fontWeight={600} mt={3} mb={1}>
              Secure Operations
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={300} mx="auto">
              Enterprise-grade security ensuring data protection and system reliability for critical railway infrastructure.
            </Typography>
          </Grid>

          {/* Feature 5 */}
          <Grid item xs={12} md={4} textAlign="center">
            <FeatureIcon icon={<Speed />} />
            <Typography variant="h6" fontWeight={600} mt={3} mb={1}>
              High Performance
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={300} mx="auto">
              Optimized for high-traffic environments with minimal latency and maximum uptime for uninterrupted service.
            </Typography>
          </Grid>

          {/* Feature 6 */}
          <Grid item xs={12} md={4} textAlign="center">
            <FeatureIcon icon={<Build />} />
            <Typography variant="h6" fontWeight={600} mt={3} mb={1}>
              Easy Management
            </Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={300} mx="auto">
              Intuitive administration interface for system configuration, monitoring, and maintenance operations.
            </Typography>
          </Grid>
        </Grid>
      </Container>

      {/* Benefits Section */}
      <Container maxWidth="md" sx={{ mb: 16 }}>
        <Typography
          variant="h4"
          fontWeight={700}
          align="center"
          gutterBottom
          sx={{ mb: 8, fontFamily: "'Poppins', sans-serif" }}
        >
          System Benefits
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          {[
            'Centralized passenger information management',
            'Multi-platform display integration',
            'Real-time data synchronization',
            'Scalable network architecture',
            'Comprehensive system monitoring',
            'User-friendly administrative interface'
          ].map((item, index) => (
            <Grid
              key={index}
              item
              xs={12}
              sm={6}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                color: 'text.primary',
                fontWeight: 600,
                fontSize: 16,
                px: 2,
              }}
            >
              <CheckCircle sx={{ color: theme.primaryColor, mr: 1 }} />
              {item}
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Final CTA Section */}
      <Box
        sx={{
          py: 8,
          textAlign: 'center',
          bgcolor: theme.primaryColor + '11',
          borderRadius: 3,
          mx: 'auto',
          maxWidth: 700,
          boxShadow: `0 0 20px 4px ${theme.primaryColor}44`,
          mb: 8
        }}
      >
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Ready to implement {theme.brandWord}?
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" mb={4}>
          Transform your railway operations with our comprehensive passenger information system.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            sx={{
              fontWeight: 700,
              borderRadius: 3,
              px: 6,
              py: 1.5,
              bgcolor: theme.primaryColor,
              color: theme.secondaryColor || '#000',
              '&:hover': {
                bgcolor: theme.primaryColor + 'cc',
                boxShadow: `0 0 12px 4px ${theme.primaryColor}`,
              },
              textTransform: 'none',
            }}
          >
            Contact Us
          </Button>
          <Button
            variant="outlined"
            size="large"
            sx={{
              fontWeight: 700,
              borderRadius: 3,
              px: 6,
              py: 1.5,
              borderColor: theme.primaryColor,
              color: theme.primaryColor,
              '&:hover': {
                bgcolor: theme.primaryColor + '11',
                borderColor: theme.primaryColor,
                color: theme.primaryColor,
              },
              textTransform: 'none',
            }}
          >
            View Documentation
          </Button>
        </Stack>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          borderTop: `1px solid ${theme.primaryColor}44`,
          pt: 4,
          mt: 8,
          textAlign: 'center'
        }}
      >
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{ 
            fontFamily: "'Inter', sans-serif",
            fontSize: '0.95rem'
          }}
        >
         
        </Typography>
      </Box>
    </Box>
  );
}