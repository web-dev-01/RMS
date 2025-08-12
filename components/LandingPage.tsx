'use client';

import React, { useRef, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Stack,
  Grid,
  Divider,
  SvgIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Link,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  CheckCircle,
  Build,
  Security,
  Speed,
  Train,
  NetworkCheck,
  Analytics,
  ExpandMore,
  Menu as MenuIcon,
  Close as CloseIcon,
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
} from '@mui/icons-material';

// Colors
const primaryColor = '#00ED64';
const secondaryColor = '#000';

// Icon wrapper for consistent size & color
const FeatureIcon = ({ icon }: { icon: React.ReactNode }) => (
  <SvgIcon sx={{ fontSize: 48, color: primaryColor }}>{icon}</SvgIcon>
);

export default function LandingPage() {
  const footerRef = useRef<HTMLDivElement>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Scroll to footer smoothly
  const scrollToFooter = () => {
    footerRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (drawerOpen) setDrawerOpen(false);
  };

  // Navigation Links
  const navLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Contact Us', onClick: scrollToFooter },
  ];

  return (
    <>
      {/* Navbar */}
      <Box
        component="nav"
        sx={{
          position: 'fixed',
          top: 0,
          width: '100%',
          bgcolor: '#1a2e2e',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: { xs: 2, sm: 3 },
          py: 1,
          zIndex: 1300,
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          userSelect: 'none',
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            color: primaryColor,
            fontWeight: 700,
            fontSize: { xs: '1rem', sm: '1.3rem' },
            fontFamily: "'Roboto Slab', serif",
            cursor: 'pointer',
          }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img
            src="/logo.png"
            alt="Logo"
            height={32}
            width={32}
            style={{ marginRight: 8 }}
          />
          IPIPS RMS
        </Box>

        {/* Desktop Menu */}
        {!isMobile && (
          <Stack direction="row" spacing={4} alignItems="center">
            {navLinks.map((link, i) =>
              link.href ? (
                <Link
                  key={i}
                  href={link.href}
                  underline="none"
                  sx={{
                    color: '#a0a0a0',
                    fontWeight: 500,
                    fontFamily: "'Roboto Slab', serif",
                    fontSize: '1rem',
                    cursor: 'pointer',
                    '&:hover': { color: '#fff' },
                  }}
                >
                  {link.label}
                </Link>
              ) : (
                <Button
                  key={i}
                  onClick={link.onClick}
                  sx={{
                    color: '#a0a0a0',
                    fontWeight: 500,
                    fontFamily: "'Roboto Slab', serif",
                    fontSize: '1rem',
                    textTransform: 'none',
                    '&:hover': { color: '#fff' },
                  }}
                >
                  {link.label}
                </Button>
              )
            )}
            <Button
              href="/login"
              variant="contained"
              sx={{
                bgcolor: primaryColor,
                color: secondaryColor,
                fontWeight: 700,
                fontFamily: "'Roboto Slab', serif",
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': { bgcolor: '#00ff80' },
              }}
            >
              Login
            </Button>
          </Stack>
        )}

        {/* Mobile Menu Button */}
        {isMobile && (
          <IconButton
            onClick={() => setDrawerOpen(true)}
            sx={{ color: '#a0a0a0' }}
            aria-label="open menu"
          >
            <MenuIcon />
          </IconButton>
        )}
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { bgcolor: '#1a2e2e', color: '#fff', width: 260 } }}
      >
        <Box
          sx={{
            height: '100%',
            fontFamily: "'Roboto Slab', serif",
            display: 'flex',
            flexDirection: 'column',
          }}
          role="presentation"
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
            <IconButton
              onClick={() => setDrawerOpen(false)}
              sx={{ color: primaryColor }}
              aria-label="close menu"
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <List sx={{ flexGrow: 1 }}>
            {navLinks.map((link, i) => (
              <ListItem
                button
                key={i}
                component={link.href ? 'a' : 'button'}
                href={link.href}
                onClick={() => {
                  if (link.onClick) link.onClick();
                  else setDrawerOpen(false);
                }}
                sx={{
                  color: primaryColor,
                  fontWeight: 600,
                  fontSize: '1.15rem',
                  py: 1.5,
                }}
              >
                <ListItemText primary={link.label} />
              </ListItem>
            ))}
          </List>

          <Box sx={{ p: 2, borderTop: `1px solid ${primaryColor}` }}>
            <Button
              href="/login"
              variant="contained"
              fullWidth
              sx={{
                bgcolor: primaryColor,
                color: secondaryColor,
                fontWeight: 700,
                fontSize: '1.1rem',
                textTransform: 'none',
                '&:hover': { bgcolor: '#00ff80' },
              }}
              onClick={() => setDrawerOpen(false)}
            >
              Login
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* Body Content */}
      <Box
        id="home"
        component="main"
        sx={{
          bgcolor: 'background.default',
          color: 'text.primary',
          minHeight: '100vh',
          pt: { xs: 10, sm: 12, md: 14 },
          pb: 12,
          px: { xs: 3, sm: 6, md: 12 },
          userSelect: 'none',
          backgroundImage: `radial-gradient(circle at top left, ${primaryColor}22, transparent 70%)`,
        }}
      >
        {/* Header with Logo */}
        <Container
          maxWidth="lg"
          sx={{ mb: { xs: 3, md: 4 }, textAlign: 'center' }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: { xs: 3, md: 4 },
            }}
          >
            <img
              src="logo.png"
              alt="RMS Logo"
              style={{
                height: 80,
                width: 'auto',
                marginRight: 16,
              }}
              loading="lazy"
            />
            <Typography
              variant="h5"
              fontWeight={600}
              sx={{
                fontFamily: "'Inter', sans-serif",
                color: 'text.primary',
                fontSize: { xs: '1.5rem', md: '1.8rem' },
              }}
            >
              IP-IPIS REMOTE MONITORING SYSTEM
            </Typography>
          </Box>
        </Container>

        {/* Hero Section */}
        <Container
          maxWidth="lg"
          sx={{ mb: { xs: 8, md: 12 }, textAlign: 'center' }}
        >
          <Typography
            variant="h2"
            component="h1"
            fontWeight={800}
            gutterBottom
            sx={{
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              fontFamily: "'Poppins', sans-serif",
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
            }}
          >
            Advanced Railway Management System for{' '}
            <Box
              component="span"
              sx={{
                color: primaryColor,
                backgroundImage: `linear-gradient(90deg, ${primaryColor}cc, ${primaryColor}ee)`,
                px: 1.5,
                borderRadius: 1,
                userSelect: 'text',
              }}
            >
              IPIPS
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
              fontSize: { xs: '1rem', md: '1.25rem' },
              lineHeight: 1.5,
            }}
          >
            Comprehensive IP-based Integrated Passenger Information System
            designed for modern railway operations, providing real-time
            information management and seamless passenger experience.
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
                px: { xs: 6, sm: 8 },
                py: 1.5,
                bgcolor: primaryColor,
                color: secondaryColor,
                '&:hover': {
                  bgcolor: primaryColor + 'cc',
                  boxShadow: `0 0 12px 4px ${primaryColor}`,
                },
                textTransform: 'none',
                fontSize: { xs: '1rem', sm: '1.1rem' },
              }}
              onClick={scrollToFooter}
            >
              Contact Us
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{
                fontWeight: 700,
                borderRadius: 3,
                px: { xs: 6, sm: 8 },
                py: 1.5,
                borderColor: primaryColor,
                color: primaryColor,
                '&:hover': {
                  bgcolor: primaryColor + '11',
                  borderColor: primaryColor,
                  color: primaryColor,
                },
                textTransform: 'none',
                fontSize: { xs: '1rem', sm: '1.1rem' },
              }}
              href="/documentation"
            >
              View Documentation
            </Button>
          </Stack>
        </Container>

        <Divider
          sx={{ borderColor: primaryColor + 'aa', mb: { xs: 6, md: 10 }, maxWidth: 800, mx: 'auto' }}
        />

        {/* Features Section */}
        <Container maxWidth="lg" sx={{ mb: { xs: 8, md: 14 } }} id="about">
          <Typography
            variant="h4"
            fontWeight={700}
            align="center"
            gutterBottom
            sx={{ mb: 6, fontFamily: "'Poppins', sans-serif", fontSize: { xs: '1.8rem', md: '2.5rem' } }}
          >
            Key Features of IPIPS
          </Typography>

          <Grid container spacing={6} justifyContent="center">
            {/* Feature 1 */}
            <Grid item xs={12} sm={6} md={4} textAlign="center">
              <FeatureIcon icon={<Train />} />
              <Typography variant="h6" fontWeight={600} mt={3} mb={1}>
                Real-time Train Information
              </Typography>
              <Typography variant="body1" color="text.secondary" maxWidth={300} mx="auto">
                Live updates on train schedules, delays, platform changes, and arrival/departure times for enhanced passenger experience.
              </Typography>
            </Grid>

            {/* Feature 2 */}
            <Grid item xs={12} sm={6} md={4} textAlign="center">
              <FeatureIcon icon={<NetworkCheck />} />
              <Typography variant="h6" fontWeight={600} mt={3} mb={1}>
                IP-based Integration
              </Typography>
              <Typography variant="body1" color="text.secondary" maxWidth={300} mx="auto">
                Seamless integration across multiple platforms using IP-based communication for reliable and scalable operations.
              </Typography>
            </Grid>

            {/* Feature 3 */}
            <Grid item xs={12} sm={6} md={4} textAlign="center">
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

        {/* Additional System Capabilities */}
        <Container maxWidth="lg" sx={{ mb: { xs: 8, md: 14 } }}>
          <Typography
            variant="h4"
            fontWeight={700}
            align="center"
            gutterBottom
            sx={{ mb: 6, fontFamily: "'Poppins', sans-serif", fontSize: { xs: '1.8rem', md: '2.5rem' } }}
          >
            Additional System Capabilities
          </Typography>

          <Grid container spacing={6} justifyContent="center">
            {/* Capability 1 */}
            <Grid item xs={12} sm={6} md={4} textAlign="center">
              <FeatureIcon icon={<Security />} />
              <Typography variant="h6" fontWeight={600} mt={3} mb={1}>
                Secure Operations
              </Typography>
              <Typography variant="body1" color="text.secondary" maxWidth={300} mx="auto">
                Enterprise-grade security ensuring data protection and system reliability for critical railway infrastructure.
              </Typography>
            </Grid>

            {/* Capability 2 */}
            <Grid item xs={12} sm={6} md={4} textAlign="center">
              <FeatureIcon icon={<Speed />} />
              <Typography variant="h6" fontWeight={600} mt={3} mb={1}>
                High Performance
              </Typography>
              <Typography variant="body1" color="text.secondary" maxWidth={300} mx="auto">
                Optimized for high-traffic environments with minimal latency and maximum uptime for uninterrupted service.
              </Typography>
            </Grid>

            {/* Capability 3 */}
            <Grid item xs={12} sm={6} md={4} textAlign="center">
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
        <Container maxWidth="md" sx={{ mb: { xs: 10, md: 16 } }}>
          <Typography
            variant="h4"
            fontWeight={700}
            align="center"
            gutterBottom
            sx={{ mb: 8, fontFamily: "'Poppins', sans-serif", fontSize: { xs: '1.8rem', md: '2.5rem' } }}
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
              'User-friendly administrative interface',
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
                  fontSize: { xs: 14, sm: 16 },
                  px: 2,
                }}
              >
                <CheckCircle sx={{ color: primaryColor, mr: 1 }} />
                {item}
              </Grid>
            ))}
          </Grid>
        </Container>

        {/* FAQ Section */}
        <Container maxWidth="md" sx={{ mb: { xs: 12, md: 20 } }}>
          <Typography
            variant="h4"
            fontWeight={700}
            align="center"
            gutterBottom
            sx={{ mb: 6, fontFamily: "'Poppins', sans-serif", fontSize: { xs: '1.8rem', md: '2.5rem' } }}
          >
            Frequently Asked Questions
          </Typography>

          {[
            {
              question: 'How does IPIPS improve passenger experience?',
              answer:
                'By delivering real-time train and platform information across multiple digital displays and devices, passengers receive timely and accurate updates.',
            },
            {
              question: 'Is the system scalable for large railway networks?',
              answer:
                'Yes, the IP-based architecture allows seamless integration and scalability across stations and regional networks.',
            },
            {
              question: 'Can the system integrate with existing railway infrastructure?',
              answer:
                'IPIPS is designed to integrate smoothly with current railway signaling and display systems through standardized protocols.',
            },
            {
              question: 'What security measures are in place?',
              answer:
                'Enterprise-grade security protocols including encryption, access control, and regular audits ensure system safety.',
            },
          ].map(({ question, answer }, index) => (
            <Accordion
              key={index}
              sx={{
                bgcolor: '#e6f7ee',
                mb: 2,
                boxShadow: 'none',
                borderRadius: 2,
                '&:before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMore sx={{ color: primaryColor }} />}
                aria-controls={`panel${index}-content`}
                id={`panel${index}-header`}
                sx={{
                  '& .MuiAccordionSummary-content': { fontWeight: 600, fontSize: 16 },
                }}
              >
                {question}
              </AccordionSummary>
              <AccordionDetails sx={{ fontSize: 15, color: 'text.secondary', pl: 3 }}>
                {answer}
              </AccordionDetails>
            </Accordion>
          ))}
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        ref={footerRef}
        sx={{
          py: { xs: 6, md: 8 },
          bgcolor: primaryColor + '11',
          borderTop: `2px solid ${primaryColor}`,
          userSelect: 'none',
          mt: 12,
          px: { xs: 3, sm: 6, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="space-between" alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h6"
                fontWeight={700}
                gutterBottom
                sx={{ color: primaryColor }}
              >
                IP-IPIS RMS
              </Typography>
              <Typography
                variant="body2"
                sx={{ lineHeight: 1.6, color: primaryColor }}
              >
                RMS for IP based Integrated Passenger Information System.<br />
                A smart solution for real-time transit monitoring, efficiency, and connectivity.
              </Typography>
            </Grid>

            <Grid item xs={12} md={6} textAlign={{ xs: 'left', md: 'right' }}>
              <Typography
                variant="h6"
                fontWeight={700}
                gutterBottom
                sx={{ color: primaryColor }}
              >
                Connect with Us
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                mt={1}
              >
                {[Facebook, Twitter, Instagram, LinkedIn].map((Icon, i) => (
                  <IconButton
                    key={i}
                    sx={{
                      color: primaryColor,
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'scale(1.15)',
                        opacity: 0.8,
                      },
                    }}
                    aria-label={`link to ${Icon.displayName || 'social media'}`}
                  >
                    <Icon />
                  </IconButton>
                ))}
              </Stack>
            </Grid>
          </Grid>

          <Box mt={{ xs: 5, md: 7 }} textAlign="center">
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{ color: primaryColor }}
            >
              RMS for IP based Integrated Passenger Information System
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              mt={1}
              sx={{ color: primaryColor }}
            >
              © 2025 TIC Kolkata | All Rights Reserved
            </Typography>
          </Box>
        </Container>
      </Box>
    </>
  );
}
