'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
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
      <Box sx={{ py: 1, bgcolor: '#121B2A', textAlign: 'center' }}>
        <Typography variant="body2" color="primary">
          Loading station info...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 1, bgcolor: '#90CAF9', textAlign: 'center' }}>
        <Typography variant="body2" color="error" fontWeight="bold">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        bgcolor: '#2E2E2E', 
        p: 1, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column' 
      }}
    >
      <Typography
        variant="subtitle1"
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
        <Typography variant="body2" color="textSecondary" textAlign="center">
          No stations available
        </Typography>
      ) : (
        <TableContainer 
          component={Paper} 
          sx={{ 
            bgcolor: '#2E2E2E', 
            flexGrow: 1,
            overflowY: 'auto' 
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 700, borderBottom: '2px solid #90CAF9', fontSize: '0.8rem', py: 0.5 }}>
                  Station (Code)
                </TableCell>
                <TableCell sx={{ color: '#C0C0C0', borderBottom: '2px solid #90CAF9', fontSize: '0.8rem', py: 0.5 }}>
                  Hindi Name
                </TableCell>
                <TableCell sx={{ color: '#A0A0A0', borderBottom: '2px solid #90CAF9', fontSize: '0.8rem', py: 0.5 }}>
                  Platforms
                </TableCell>
                <TableCell sx={{ color: '#A0A0A0', borderBottom: '2px solid #90CAF9', fontSize: '0.8rem', py: 0.5 }}>
                  Spl Platforms
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {stations.map((station) => (
                <TableRow key={station.StationCode} hover>
                  <TableCell sx={{ color: '#d7dadd', fontWeight: 700, border: 'none', fontSize: '0.8rem', py: 0.5, whiteSpace: 'nowrap' }}>
                    {station.StationNameEnglish} ({station.StationCode})
                  </TableCell>
                  <TableCell sx={{ color: '#C0C0C0', border: 'none', fontSize: '0.8rem', py: 0.5 }}>
                    {station.StationNameHindi}
                  </TableCell>
                  <TableCell sx={{ color: '#A0A0A0', border: 'none', fontSize: '0.8rem', py: 0.5 }}>
                    {station.NumberOfPlatforms}
                  </TableCell>
                  <TableCell sx={{ color: '#A0A0A0', border: 'none', fontSize: '0.8rem', py: 0.5 }}>
                    {station.NumberOfSplPlatforms}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
