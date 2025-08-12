'use client';

import React, { useEffect, useState } from 'react';
import Template from '@/app/dashboard/Template';
import { Box, Card, Typography } from '@mui/material';

type StationType = {
  StationCode: string;
  StationNameEnglish: string;
  StationNameHindi: string;
  StationNameRegional: string;
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
          sx={{
            color: '#6bb4d8',
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
            {stations.map((station) => {
              const showRegional =
                station.StationNameRegional &&
                station.StationNameRegional.trim() !== '' &&
                station.StationNameRegional.trim() !==
                  station.StationNameHindi.trim();

              return (
                <Card
                  key={station.StationCode}
                  sx={{
                    bgcolor: '#2E2E2E',
                    borderRadius: 2,
                    border: '1px solid #90CAF9',
                    p: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                  }}
                >
                  <Typography
                    sx={{
                      color: '#90CAF9',
                      fontWeight: 700,
                      fontSize: '1rem',
                    }}
                  >
                    {station.StationNameEnglish} ({station.StationCode})
                  </Typography>

                  <Typography
                    sx={{
                      color: '#C0C0C0',
                      fontWeight: 700,
                      fontSize: '1rem',
                    }}
                  >
                    {station.StationNameHindi}
                  </Typography>

                  {showRegional && (
                    <Typography
                      sx={{
                        color: '#C0C0C0',
                        fontWeight: 700,
                        fontSize: '1rem',
                      }}
                    >
                      {station.StationNameRegional}
                    </Typography>
                  )}
                </Card>
              );
            })}
          </Box>
        )}
      </Box>
    </Template>
  );
}
