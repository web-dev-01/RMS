'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
} from '@mui/material';

type StationType = {
  StationCode: string;
  StationNameEnglish: string;
  StationNameHindi: string;
  NumberOfPlatforms: number;
  NumberOfSplPlatforms: number;
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
      <Box sx={{ py: 2, bgcolor: '#121B2A', textAlign: 'center' }}>
        <Typography variant="h6" color="primary">
          Loading station info...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 2, bgcolor: '#121B2A', textAlign: 'center' }}>
        <Typography variant="h6" color="error" fontWeight="bold">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#121B2A', p: 2 }}>
      <Typography
        variant="h6"
        sx={{
          color: '#6bb4d8',
          mb: 1,
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        Station Information
      </Typography>

      {stations.length === 0 ? (
        <Typography variant="h6" color="textSecondary" textAlign="center">
          No stations available
        </Typography>
      ) : (
        stations.map((station) => (
          <Card
            key={station.StationCode}
            sx={{
              bgcolor: '#2E2E2E',
              borderRadius: 2,
              border: '1px solid #90CAF9',
              overflow: 'hidden',
              mb: 2,
            }}
          >
            <TableContainer sx={{ backgroundColor: '#2E2E2E' }}>
              <Table size="small" sx={{ borderCollapse: 'collapse' }}>
                <TableBody>
                  <TableRow>
                    <TableCell sx={{ color: '#90CAF9', fontWeight: 700, border: 'none' }}>
                      {station.StationNameEnglish} ({station.StationCode})
                    </TableCell>
                    <TableCell sx={{ color: '#C0C0C0', border: 'none' }}>
                      {station.StationNameHindi}
                    </TableCell>
                    <TableCell sx={{ color: '#A0A0A0', border: 'none' }}>
                      Platforms: {station.NumberOfPlatforms}
                    </TableCell>
                    <TableCell sx={{ color: '#A0A0A0', border: 'none' }}>
                      Special Platforms: {station.NumberOfSplPlatforms}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        ))
      )}
    </Box>
  );
}
