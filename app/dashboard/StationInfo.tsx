'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
      <Box sx={{ py: 2, bgcolor: '#90CAF9', textAlign: 'center' }}>
        <Typography variant="h6" color="error" fontWeight="bold">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#2E2E2E', p: 2 }}>
      <Typography
        variant="h6"
        sx={{
          color: '#6bb4d8',
          mb: 2,
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
        <Card
          sx={{
            bgcolor: '#2E2E2E',
            border: '1px solid #2E2E2E',
            p: 2,
            overflow: 'hidden',
          }}
        >
          <TableContainer sx={{ bgcolor: '#2E2E2E', width: '100%' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      color: '#90CAF9',
                      fontWeight: 700,
                      borderBottom: '2px solid #90CAF9',
                      py: 0.5,
                      px: 1,
                      fontSize: '0.85rem',
                    }}
                  >
                    Station (Code)
                  </TableCell>
                  <TableCell
                    sx={{
                      color: '#C0C0C0',
                      borderBottom: '2px solid #90CAF9',
                      py: 0.5,
                      px: 1,
                      fontSize: '0.85rem',
                    }}
                  >
                    Hindi Name
                  </TableCell>
                  <TableCell
                    sx={{
                      color: '#A0A0A0',
                      borderBottom: '2px solid #90CAF9',
                      py: 0.5,
                      px: 1,
                      fontSize: '0.85rem',
                    }}
                  >
                    Platforms
                  </TableCell>
                  <TableCell
                    sx={{
                      color: '#A0A0A0',
                      borderBottom: '2px solid #90CAF9',
                      py: 0.5,
                      px: 1,
                      fontSize: '0.85rem',
                    }}
                  >
                    Spl Platforms
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stations.map((station) => (
                  <TableRow key={station.StationCode}>
                    <TableCell
                      sx={{
                        color: '#d7dadd',
                        fontWeight: 700,
                        border: 'none',
                        py: 0.5,
                        px: 1,
                        fontSize: '0.85rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {station.StationNameEnglish} ({station.StationCode})
                    </TableCell>
                    <TableCell
                      sx={{
                        color: '#C0C0C0',
                        border: 'none',
                        py: 0.5,
                        px: 1,
                        fontSize: '0.85rem',
                        whiteSpace: 'normal',
                      }}
                    >
                      {station.StationNameHindi}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: '#A0A0A0',
                        border: 'none',
                        py: 0.5,
                        px: 1,
                        fontSize: '0.85rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {station.NumberOfPlatforms}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: '#A0A0A0',
                        border: 'none',
                        py: 0.5,
                        px: 1,
                        fontSize: '0.85rem',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {station.NumberOfSplPlatforms}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Box>
  );
}