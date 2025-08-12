'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useRouter } from 'next/navigation';

interface Train {
  _id: string;
  TrainNumber: string;
  TrainNameEnglish: string;
  TrainNameHindi: string;
  Ref: 'NTES' | 'User';
  SrcCode: string;
  SrcNameEnglish: string;
  SrcNameHindi: string;
  DestCode: string;
  DestNameEnglish: string;
  DestNameHindi: string;
  STA: string;
  STD: string;
  LateBy: string;
  ETA: string;
  ETD: string;
  PFNo: string;
  Status: 'Running Late' | 'On Time' | 'Arriving Soon' | 'Arrived' | 'Departed';
  TypeAorD: 'A' | 'D';
  CoachList: string[];
}

export default function ActiveTrains() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const stationCode = 'NDLS'; // TODO: make dynamic later
  const router = useRouter();

  const fetchTrains = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rms/active-trains?stationCode=${stationCode}`, {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      });
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setTrains(json.data);
      } else {
        setTrains([]);
        console.warn(json.message || 'No active trains found');
      }
    } catch (error) {
      console.error('Error fetching active trains:', error);
      setTrains([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrains();
  }, [stationCode]);

  return (
    <Card
      sx={{
        bgcolor: '#1E1E1E',
        borderRadius: 2,
        border: '1px solid #90CAF9',
        height: '350px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" sx={{ color: '#90CAF9', textAlign: 'center' }}>
            Active Trains ({stationCode})
          </Typography>
        }
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              aria-label="refresh"
              onClick={fetchTrains}
              sx={{ color: '#90CAF9' }}
              disabled={loading}
            >
              <RefreshIcon />
            </IconButton>
            <Button
              variant="outlined"
              size="small"
              sx={{ color: '#90CAF9', borderColor: '#90CAF9' }}
              onClick={() => router.push('/active-trains')}
            >
              View All
            </Button>
          </Box>
        }
        sx={{ pb: 1 }}
      />

      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={28} sx={{ color: '#90CAF9' }} />
        </Box>
      ) : trains.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' }}>
          No active trains for {stationCode}
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            bgcolor: 'transparent',
            flex: 1,
            overflowY: 'auto',
            width: '90%',
            mx: 'auto',
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#555', borderRadius: '3px' },
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Train Number</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Train Name</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>From</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>To</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Scheduled Arrival</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Scheduled Departure</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Platform No</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {trains.map((train) => (
                <TableRow key={train._id}>
                  <TableCell sx={{ color: '#E0E0E0' }}>{train.TrainNumber}</TableCell>
                  <TableCell sx={{ color: '#E0E0E0' }}>{train.TrainNameEnglish}</TableCell>
                  <TableCell sx={{ color: '#E0E0E0' }}>
                    {train.SrcCode} - {train.SrcNameEnglish}
                  </TableCell>
                  <TableCell sx={{ color: '#E0E0E0' }}>
                    {train.DestCode} - {train.DestNameEnglish}
                  </TableCell>
                  <TableCell sx={{ color: '#E0E0E0' }}>{train.STA}</TableCell>
                  <TableCell sx={{ color: '#E0E0E0' }}>{train.STD}</TableCell>
                  <TableCell sx={{ color: '#E0E0E0' }}>{train.Status}</TableCell>
                  <TableCell sx={{ color: '#E0E0E0' }}>{train.PFNo}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}
