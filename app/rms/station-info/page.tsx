'use client';

import React, { useEffect, useState } from 'react';
import Template from '@/app/dashboard/Template';
import { Box, Card, Typography } from '@mui/material';

type StationType = {
  StationCode: string;
  StationNameEnglish: string;
  StationNameHindi: string;
  StationNameRegional: string;
  Latitude: number;
  Longitude: number;
  Altitude: number;
  NumberOfPlatforms: number;
  NumberOfSplPlatforms: number;
  NumberOfStationEntrances: number;
  NumberOfPlatformBridges: number;
  RegionalLanguage: string;
};

export default function StationInfo() {
  const [stations, setStations] = useState<StationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const res = await fetch('/api/rms/station-info');
        if (!res.ok) throw new Error('Failed to fetch stations');
        const data = await res.json();
        if (data.success) {
          setStations(data.data);
        } else {
          setError('Failed to load stations data');
        }
      } catch (err) {
        setError((err as Error).message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  if (loading) {
    return (
      <Template>
        <Box
          sx={{
            minHeight: '80vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#121B2A',
          }}
        >
          <Typography variant="h6" color="primary">
            Loading station info...
          </Typography>
        </Box>
      </Template>
    );
  }

  if (error) {
    return (
      <Template>
        <Box
          sx={{
            minHeight: '80vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#121B2A',
          }}
        >
          <Typography variant="h6" color="error" fontWeight="bold">
            {error}
          </Typography>
        </Box>
      </Template>
    );
  }

  return (
    <Template>
      <Box
        sx={{
          bgcolor: '#121B2A',
          p: 0,
          color: '#E0E0E0',
          maxWidth: '100vw',
        }}
      >
        <Typography
          variant="h4"
          fontWeight="400"
          gutterBottom={false}
          sx={{
            color: '#6bb4d8',
            mb: 0,
            pt: 0,
            textAlign: 'center',
            borderBottom: '1px solid #444',
            userSelect: 'none',
          }}
        >
          Station Information
        </Typography>

        {stations.length === 0 ? (
          <Typography
            variant="h6"
            color="textSecondary"
            textAlign="center"
            sx={{ mt: 10 }}
          >
            No stations available
          </Typography>
        ) : (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              overflowY: 'auto',
              maxHeight: '80vh',
              pb: 1,
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#90CAF9',
                borderRadius: '4px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#0A0F19',
              },
            }}
          >
            {stations.map((station) => (
              <Card
                key={station.StationCode}
                sx={{
                  bgcolor: '#2E2E2E',
                  borderRadius: 2,
                  border: '1px solid #90CAF9',
                  width: { xs: '100%', sm: '100%', md: '95%', lg: 1450 },
                  height: 'auto',
                  flex: '0 0 auto',
                  display: 'flex',
                  justifyContent: 'center',
                  p: 1,
                  minHeight: '18px',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'column', md: 'row' },
                    width: '100%',
                    alignItems: { xs: 'flex-start', md: 'center' },
                    gap: 1,
                    p: 1,
                  }}
                >
                  <Box
                    sx={{
                      flex: 1,
                      pr: { md: 1 },
                      borderRight: { md: '1px solid #444' },
                      borderBottom: { xs: '1px solid #444', md: 'none' },
                      width: '100%',
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#90CAF9',
                        fontWeight: 700,
                        fontSize: '1rem',
                        whiteSpace: 'nowrap',
                      }}
                      title={station.StationNameEnglish}
                    >
                      {station.StationNameEnglish} ({station.StationCode})
                    </Typography>
                    <Typography
                      sx={{
                        color: '#C0C0C0',
                        fontSize: '0.9rem',
                        whiteSpace: 'nowrap',
                      }}
                      title={station.StationNameHindi}
                    >
                      HI: {station.StationNameHindi}
                    </Typography>
                    <Typography
                      sx={{
                        color: '#C0C0C0',
                        fontSize: '0.9rem',
                        whiteSpace: 'nowrap',
                      }}
                      title={station.StationNameRegional}
                    >
                      REG: {station.StationNameRegional}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      flex: 1,
                      px: { md: 1 },
                      borderRight: { md: '1px solid #444' },
                      borderBottom: { xs: '1px solid #444', md: 'none' },
                      width: '100%',
                    }}
                  >
                    <Typography sx={{ color: '#A0A0A0', fontSize: '0.9rem' }}>
                      Location: ({station.Latitude.toFixed(3)},{' '}
                      {station.Longitude.toFixed(3)})
                    </Typography>
                    <Typography sx={{ color: '#A0A0A0', fontSize: '0.9rem' }}>
                      Altitude: {station.Altitude} m
                    </Typography>
                    <Typography sx={{ color: '#A0A0A0', fontSize: '0.9rem' }}>
                      Platforms: {station.NumberOfPlatforms}
                    </Typography>
                    <Typography sx={{ color: '#A0A0A0', fontSize: '0.9rem' }}>
                      Special Platforms: {station.NumberOfSplPlatforms}
                    </Typography>
                  </Box>

                  <Box sx={{ flex: 1, pl: { md: 1 }, width: '100%' }}>
                    <Typography sx={{ color: '#A0A0A0', fontSize: '0.9rem' }}>
                      Entrances: {station.NumberOfStationEntrances}
                    </Typography>
                    <Typography sx={{ color: '#A0A0A0', fontSize: '0.9rem' }}>
                      Bridges: {station.NumberOfPlatformBridges}
                    </Typography>
                    <Typography sx={{ color: '#A0A0A0', fontSize: '0.9rem' }}>
                      Regional Lang: {station.RegionalLanguage}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            ))}
          </Box>
        )}
      </Box>
    </Template>
  );
}
