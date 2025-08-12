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

// Define interfaces based on the Mongoose schema
interface Device {
  Id: number;
  DeviceType: 'CDS' | 'PDC' | 'CGDB' | 'AGDB';
  Description: string;
  IpAddress: string;
  Status: boolean;
  LastStatusWhen: string;
  IsEnabled: boolean;
}

interface Platform {
  PlatformNumber: string;
  PlatformType: string;
  Description: string;
  Subnet: string;
  Devices: Device[];
}

interface PlatformDevice {
  stationCode: string;
  stationName: string;
  platforms: Platform[];
}

export default function PlatformsDevices() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const stationCode = 'NDLS'; // TODO: Make dynamic later
  const router = useRouter();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rms/platforms-devices?stationCode=${stationCode}`, {
        headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '' },
      });
      const json = await res.json();
      if (json.success && json.data && Array.isArray(json.data.platforms)) {
        setPlatforms(json.data.platforms);
      } else {
        console.warn('No platforms data found for stationCode:', stationCode);
        setPlatforms([]);
      }
    } catch (err) {
      console.error('Error fetching Platforms & Devices:', err);
      setPlatforms([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [stationCode]);

  return (
    <Card
      sx={{
        bgcolor: '#1E1E1E',
        borderRadius: 2,
        border: '1px solid #90CAF9',
        height: '350px',
        display: 'flex',
        pb: 0,
        pt: 0,
        px: 0,
        py: 0,
        overflow: 'auto',
        flexDirection: 'column',
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" sx={{ color: '#90CAF9', textAlign: 'center' }}>
            Platforms & Devices ({stationCode})
          </Typography>
        }
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              aria-label="refresh"
              onClick={fetchData}
              sx={{ color: '#90CAF9' }}
              disabled={loading}
            >
              <RefreshIcon />
            </IconButton>
            <Button
              variant="outlined"
              size="small"
              sx={{ color: '#90CAF9', borderColor: '#90CAF9' }}
              onClick={() => router.push('/platforms-devices')}
            >
              View More
            </Button>
          </Box>
        }
        sx={{ pb: 1 }}
      />

      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={28} sx={{ color: '#90CAF9' }} />
        </Box>
      ) : platforms.length === 0 ? (
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' }}>
          No platforms available for {stationCode}
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            bgcolor: 'transparent',
            flex: 1,
            overflowY: 'auto',
            width: '100%',
            mx: 'auto',
            '&::-webkit-scrollbar': {
              width: '10px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#7b847d',
              borderRadius: '3px',
            },
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Platform Number</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Platform Type</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Description</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Subnet</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Devices</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {platforms.map((platform, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ color: '#E0E0E0' }}>{platform.PlatformNumber}</TableCell>
                  <TableCell sx={{ color: '#E0E0E0' }}>{platform.PlatformType}</TableCell>
                  <TableCell sx={{ color: '#E0E0E0' }}>{platform.Description}</TableCell>
                  <TableCell sx={{ color: '#E0E0E0' }}>{platform.Subnet}</TableCell>
                  <TableCell sx={{ color: '#E0E0E0', whiteSpace: 'pre-line' }}>
                    {platform.Devices.length > 0
                      ? platform.Devices.map((device) => `${device.DeviceType} (${device.IpAddress})`).join('\n')
                      : 'No devices'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}
