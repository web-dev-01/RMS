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

interface ActiveTrainsProps {
  trains?: Train[];
  loading?: boolean;
  error?: string | null;
  stationCode?: string;
}

export default function ActiveTrains({ 
  trains: propTrains, 
  loading: propLoading, 
  error: propError, 
  stationCode: propStationCode 
}: ActiveTrainsProps) {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState(true);
  const stationCode = propStationCode || 'NDLS'; // Use prop or default
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
    // If props are provided, use them instead of fetching
    if (propTrains !== undefined && propLoading !== undefined) {
      setTrains(propTrains);
      setLoading(propLoading);
    } else {
      fetchTrains();
    }
  }, [stationCode, propTrains, propLoading]);

  // Use prop values if provided, otherwise use local state
  const displayTrains = propTrains !== undefined ? propTrains : trains;
  const displayLoading = propLoading !== undefined ? propLoading : loading;

  return (
    <Card
      sx={{
        bgcolor: '#1E1E1E',
        borderRadius: 0,
        padding: 0,
        marginTop: '2px',
        border: '1px solid #90CAF9',
        height: '350px',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      <CardHeader
        title={
          <Typography
            variant="h5"
            sx={{ color: '#90CAF9', textAlign: 'center', fontSize: '1rem' }}
          >
            Active Trains ({stationCode})
          </Typography>
        }
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              aria-label="refresh"
              onClick={fetchTrains}
              sx={{ color: '#90CAF9' }}
              disabled={displayLoading}
            >
              <RefreshIcon />
            </IconButton>
            <Button
              variant="outlined"
              size="small"
              sx={{ color: '#90CAF9', borderColor: '#90CAF9' }}
              onClick={() => router.push('/rms/active-trains')}
            >
              View All
            </Button>
          </Box>
        }
        sx={{ pb: 1 }}
      />

      {displayLoading ? (
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={28} sx={{ color: '#90CAF9' }} />
        </Box>
      ) : displayTrains.length === 0 ? (
        <Box
          sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' }}
        >
          {propError || `No active trains for ${stationCode}`}
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            bgcolor: 'transparent',
            flex: 1,
            overflowY: 'auto',
            width: '100%',
            margin: 0,
            padding: 0,
            boxShadow: 'none',
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#555', borderRadius: '3px' },
          }}
        >
          <Table
            size="small"
            stickyHeader
            sx={{
              width: '100%',
              minWidth: '100%',
              tableLayout: 'fixed',
              borderCollapse: 'collapse',
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Train Number</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Train Name</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>From</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>To</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>STA</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>STD</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>ETA</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>ETD</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Platform No</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayTrains.map((train) => (
                <TableRow key={train._id} hover>
                  <TableCell sx={{ color: '#E0E0E0', overflowWrap: 'break-word' }}>{train.TrainNumber}</TableCell>
                  <TableCell sx={{ color: '#E0E0E0', overflowWrap: 'break-word' }}>{train.TrainNameEnglish}</TableCell>
                  <TableCell sx={{ color: '#E0E0E0', overflowWrap: 'break-word' }}>
                    {train.SrcCode} - {train.SrcNameEnglish}
                  </TableCell>
                  <TableCell sx={{ color: '#E0E0E0', overflowWrap: 'break-word' }}>
                    {train.DestCode} - {train.DestNameEnglish}
                  </TableCell>
                  <TableCell sx={{ color: '#E0E0E0', overflowWrap: 'break-word' }}>{train.STA}</TableCell>
                  <TableCell sx={{ color: '#E0E0E0', overflowWrap: 'break-word' }}>{train.STD}</TableCell>
                  <TableCell sx={{ color: '#E0E0E0', overflowWrap: 'break-word' }}>{train.ETA}</TableCell>
                  <TableCell sx={{ color: '#E0E0E0', overflowWrap: 'break-word' }}>{train.ETD}</TableCell>
                  <TableCell sx={{ color: '#E0E0E0', overflowWrap: 'break-word' }}>{train.Status}</TableCell>
                  <TableCell sx={{ color: '#E0E0E0', overflowWrap: 'break-word' }}>{train.PFNo || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}