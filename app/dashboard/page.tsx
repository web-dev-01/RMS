'use client';
import 'leaflet/dist/leaflet.css';

import React, { useEffect, useState } from 'react';
import Template from '@/app/dashboard/Template';
import ActiveTrains from '@/app/dashboard/ActiveTrains';
import PlatformsDevices from '@/app/dashboard/PlatformsDevices';
import CAPAlerts from '@/app/dashboard/CAPAlerts';
import EventLogs from '@/app/dashboard/EventLogs';
import StationInfo from '@/app/dashboard/StationInfo';

import { Box, Container, Grid, Typography, Stack, IconButton, Card } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';

export default function Dashboard() {
  const [trains, setTrains] = useState<any[]>([]);
  const [loadingTrains, setLoadingTrains] = useState(true);
  const [errorTrains, setErrorTrains] = useState<string | null>(null);
  const stationCode = 'NDLS';

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
      {/* Station Info */}
      <Card
        sx={{
          bgcolor: '#90CAF9',
          border: '1px solid #90CAF9',
          borderRadius: 2,
          p: 0,
          px:0,
          pt:0,
          mt:0,
        }}
      >
        <StationInfo />
      </Card>

      {/* Active Trains */}
      <Box sx={{ mt: 1 }}>
        <ActiveTrains
          trains={trains}
          loading={loadingTrains}
          error={errorTrains}
          stationCode={stationCode}
        />
      </Box>

      {/* Row 2: Platforms & Devices + Event Logs (Reduced Height, Same Width) */}
      <Box
        sx={{
          mt: 1,
          display: 'flex',
          width: '100%',
          gap: 2,
          height: '400px', // reduced height from 600px to 400px
        }}
      >
        <Card
          sx={{
            flexBasis: '55%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <PlatformsDevices />
        </Card>

        <Card
          sx={{
            flexBasis: '50%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <EventLogs />
        </Card>
      </Box>

      {/* Row 3: CAP Alerts */}
      <Box sx={{ mt: 2 }}>
        <Card>
          <CAPAlerts />
        </Card>
      </Box>

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
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: textGreen }}>
                IP-IPIS RMS
              </Typography>
              <Typography variant="body2" sx={{ lineHeight: 1.6, color: textGreen }}>
                RMS for IP based Integrated Passenger Information System.<br />
                A smart solution for real-time transit monitoring, efficiency, and connectivity.
              </Typography>
            </Box>

            <Box sx={{ flex: '1 1 300px', minWidth: '300px' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: textGreen }}>
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
            </Box>
          </Box>

          <Box mt={{ xs: 5, md: 7 }} textAlign="center">
            <Typography variant="body2" fontWeight={500} sx={{ color: textGreen }}>
              RMS for IP based Integrated Passenger Information System
            </Typography>
            <Typography variant="body2" fontWeight={600} mt={1} sx={{ color: textGreen }}>
              © 2025 TIC Kolkata | All Rights Reserved
            </Typography>
          </Box>
        </Container>
      </Box>
    </Template>
  );
}