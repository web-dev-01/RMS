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
  Chip,
  Alert,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ClearIcon from '@mui/icons-material/Clear';
import { useRouter } from 'next/navigation';

interface Train {
  _id: string;
  StationCode: string;
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
  ETD?: string;
  PFNo: string;
  Status: 'Running Late' | 'On Time' | 'Arriving Soon' | 'Arrived' | 'Departed';
  TypeAorD: 'A' | 'D';
  CoachList: string[];
  batchId: string;
  lastUpdated: string;
}

interface ActiveTrainsProps {
  trains?: Train[];
  loading?: boolean;
  error?: string | null;
  stationCode?: string;
  showActions?: boolean;
}

interface ApiResponse {
  success: boolean;
  data: Train[];
  message?: string;
  stationCode?: string;
  batchId?: string;
  totalRecords?: number;
}

const ActiveTrains: React.FC<ActiveTrainsProps> = ({
  trains: propTrains,
  loading: propLoading,
  error: propError,
  stationCode: propStationCode,
  showActions = true,
}) => {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [stationCode, setStationCode] = useState<string | null>(propStationCode || null);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState<number>(0);
  const [lastFetch, setLastFetch] = useState<Date | null>(null);
  const router = useRouter();

  const fetchTrains = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/rms/active-trains', {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      });
      const json: ApiResponse = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setTrains(json.data);
        setStationCode(json.stationCode || null);
        setBatchId(json.batchId || null);
        setTotalRecords(json.totalRecords || json.data.length);
        setLastFetch(new Date());
        setError(null);
      } else {
        setTrains([]);
        setError(json.message || 'No active trains found');
      }
    } catch (error) {
      console.error('Error fetching active trains:', error);
      setTrains([]);
      setError('Error fetching active trains');
    } finally {
      setLoading(false);
    }
  };

  const clearAllTrains = async (): Promise<void> => {
    if (!confirm('Are you sure you want to clear all train data? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/rms/active-trains?clearAll=true', {
        method: 'DELETE',
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      });
      const json = await res.json();

      if (json.success) {
        setTrains([]);
        setError('All train data cleared');
        setBatchId(null);
        setTotalRecords(0);
      } else {
        setError(json.message || 'Failed to clear trains');
      }
    } catch (error) {
      console.error('Error clearing trains:', error);
      setError('Error clearing trains');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propTrains !== undefined && propLoading !== undefined) {
      setTrains(propTrains);
      setLoading(propLoading);
      setError(propError || null);
      if (propStationCode) setStationCode(propStationCode);
    } else {
      fetchTrains();
    }
  }, [propTrains, propLoading, propError, propStationCode]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (propTrains === undefined) {
      const interval = setInterval(fetchTrains, 30000);
      return () => clearInterval(interval);
    }
  }, [propTrains]);

  const displayTrains = propTrains !== undefined ? propTrains : trains;
  const displayLoading = propLoading !== undefined ? propLoading : loading;
  const displayError = propError !== undefined ? propError : error;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'On Time': return '#4CAF50';
      case 'Running Late': return '#FF9800';
      case 'Arriving Soon': return '#2196F3';
      case 'Arrived': return '#9C27B0';
      case 'Departed': return '#757575';
      default: return '#90CAF9';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'A' ? '#4CAF50' : '#FF9800';
  };

  const formatLastUpdated = (lastUpdated: string) => {
    const now = new Date();
    const updated = new Date(lastUpdated);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ${diffMins % 60}m ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const formatTime = (time: Date) => {
    return time.toLocaleTimeString('en-IN', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <Card
      sx={{
        bgcolor: '#1E1E1E',
        borderRadius: 0,
        padding: 0,
        marginTop: '2px',
        border: '1px solid #90CAF9',
        height: showActions ? '400px' : '350px',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}
    >
      <CardHeader
        title={
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5" sx={{ color: '#90CAF9', fontSize: '1.2rem' }}>
              Current Active Trains {stationCode ? `(${stationCode})` : '(Loading Station...)'}
            </Typography>
            {batchId && (
              <Typography variant="caption" sx={{ color: '#888', fontSize: '0.7rem' }}>
               
              </Typography>
            )}
          </Box>
        }
        action={
          showActions ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton
                aria-label="refresh"
                onClick={fetchTrains}
                sx={{ color: '#90CAF9' }}
                disabled={displayLoading}
                title="Refresh trains"
              >
                <RefreshIcon />
              </IconButton>
              <IconButton
                aria-label="clear all"
                onClick={clearAllTrains}
                sx={{ color: '#FF5722' }}
                disabled={displayLoading}
                title="Clear all trains"
              >
                <ClearIcon />
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
          ) : null
        }
        sx={{ pb: 1 }}
      />

      {displayLoading ? (
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={28} sx={{ color: '#90CAF9' }} />
        </Box>
      ) : displayError && displayTrains.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' }}>
          {displayError}
        </Box>
      ) : displayTrains.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' }}>
          No active trains {stationCode ? `for ${stationCode}` : ''}
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
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold', width: '8%' }}>Train #</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold', width: '14%' }}>Train Name</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold', width: '10%' }}>From</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold', width: '10%' }}>To</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold', width: '5%' }}>STA</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold', width: '5%' }}>STD</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold', width: '5%' }}>ETA</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold', width: '5%' }}>ETD</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold', width: '10%' }}>Status</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold', width: '5%' }}>PF</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold', width: '5%' }}>Type</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold', width: '8%' }}>Late By</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold', width: '10%' }}>Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayTrains.map((train) => (
                <TableRow 
                  key={train._id} 
                  hover
                  sx={{
                    opacity: ['Arrived', 'Departed'].includes(train.Status) ? 0.7 : 1,
                    '&:hover': {
                      backgroundColor: 'rgba(144, 202, 249, 0.08)',
                    }
                  }}
                >
                  <TableCell sx={{ color: '#E0E0E0', fontSize: '0.75rem' }}>
                    {train.TrainNumber}
                  </TableCell>
                  <TableCell sx={{ color: '#E0E0E0', fontSize: '0.75rem' }} title={train.TrainNameHindi}>
                    {train.TrainNameEnglish || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: '#E0E0E0', fontSize: '0.75rem' }} title={train.SrcNameEnglish}>
                    {train.SrcCode}
                  </TableCell>
                  <TableCell sx={{ color: '#E0E0E0', fontSize: '0.75rem' }} title={train.DestNameEnglish}>
                    {train.DestCode || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: '#E0E0E0', fontSize: '0.75rem' }}>
                    {train.STA || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: '#E0E0E0', fontSize: '0.75rem' }}>
                    {train.STD || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: '#E0E0E0', fontSize: '0.75rem' }}>
                    {train.ETA || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ color: '#E0E0E0', fontSize: '0.75rem' }}>
                    {train.ETD || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>
                    <Chip
                      label={train.Status || 'Unknown'}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(train.Status),
                        color: 'white',
                        fontSize: '0.65rem',
                        height: '20px',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#E0E0E0', fontSize: '0.75rem' }}>
                    {train.PFNo || 'N/A'}
                  </TableCell>
                  <TableCell sx={{ fontSize: '0.75rem' }}>
                    <Chip
                      label={train.TypeAorD || 'N/A'}
                      size="small"
                      sx={{
                        backgroundColor: train.TypeAorD ? getTypeColor(train.TypeAorD) : '#757575',
                        color: 'white',
                        fontSize: '0.65rem',
                        height: '18px',
                        width: '24px',
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: train.LateBy && train.LateBy !== '0' ? '#FF9800' : '#4CAF50', fontSize: '0.75rem' }}>
                    {train.LateBy || 'On Time'}
                  </TableCell>
                  <TableCell sx={{ color: '#888', fontSize: '0.65rem' }}>
                    {formatLastUpdated(train.lastUpdated)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {displayError && displayTrains.length > 0 && (
        <Alert severity="warning" sx={{ mx: 2, mb: 1 }}>
          <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
            {displayError}
          </Typography>
        </Alert>
      )}
    </Card>
  );
};

export default ActiveTrains;