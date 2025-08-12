'use client';

import React, { useEffect, useState } from 'react';
import Template from '@/app/dashboard/Template';
import StationInfo from '@/app/dashboard/StationInfo';
import ActiveTrains from '@/app/dashboard/ActiveTrains';
import PlatformsDevices from '@/app/dashboard/PlatformsDevices';
import CAPAlerts from '@/app/dashboard/CAPAlerts';
import EventLogs from '@/app/dashboard/EventLogs';

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

export default function Dashboard() {
  const [trains, setTrains] = useState<any[]>([]);
  const [loadingTrains, setLoadingTrains] = useState(true);
  const [errorTrains, setErrorTrains] = useState<string | null>(null);
  const stationCode = 'NDLS'; // fixed for now

  // Color for footer text and border
  const textGreen = '#8e988e';

  useEffect(() => {
    async function fetchTrains() {
      setLoadingTrains(true);
      setErrorTrains(null);
      try {
        const res = await fetch(`/api/rms/active-trains?stationCode=${stationCode}`, {
          headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '' },
        });
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          setTrains(json.data);
        } else {
          setTrains([]);
          setErrorTrains(json.message || 'No active trains found');
        }
      } catch (err) {
        setErrorTrains('Failed to fetch active trains');
        setTrains([]);
      } finally {
        setLoadingTrains(false);
      }
    }
    fetchTrains();
  }, [stationCode]);

  return (
    <Template>
      {/* Station Info on top */}
      <StationInfo />

      {/* Row 1: Active Trains + Platforms & Devices */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        {/* Active Trains - 65% */}
        <div style={{ flex: '6.5' }}>
          {/* If your ActiveTrains component doesn't accept props, just use <ActiveTrains /> */}
          <ActiveTrains
            trains={trains}
            loading={loadingTrains}
            error={errorTrains}
            stationCode={stationCode}
          />
        </div>

        {/* Platforms & Devices - 35% */}
        <div style={{ flex: '3.5' }}>
          <PlatformsDevices />
        </div>
      </div>

      {/* Row 2: CAP Alerts + Event Logs */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        {/* CAP Alerts - 65% */}
        <div style={{ flex: '6.5' }}>
          <CAPAlerts />
        </div>

        {/* Event Logs - 35% */}
        <div style={{ flex: '3.5' }}>
          <EventLogs />
        </div>
      </div>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 6,
          bgcolor: '#0A0F19',
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
                IP-IPIS RMS
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
    </Template>
  );
}
