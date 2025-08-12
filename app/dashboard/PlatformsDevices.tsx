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
  Collapse,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useRouter } from 'next/navigation';

interface Device {
  Id: number;
  DeviceType: 'CDS' | 'PDC' | 'CGDB' | 'AGDB';
  IpAddress: string;
  Status: boolean;
  LastStatusWhen: string;
  IsEnabled: boolean;
}

interface Platform {
  PlatformNumber: string;
  PlatformType: string;
  Subnet: string;
  Devices: Device[];
}

export default function PlatformsDevices() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlatformIndex, setExpandedPlatformIndex] = useState<number | null>(null);
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

  const toggleExpand = (index: number) => {
    setExpandedPlatformIndex((prev) => (prev === index ? null : index));
  };

  return (
    <Card
      sx={{
        bgcolor: '#1E1E1E',
        borderRadius: 2,
        border: '1px solid #90CAF9',
        height: '450px',
        display: 'flex',
        flexDirection: 'column',
        pb: 0,
        pt: 0,
        px: 0,
        py: 0,
        overflow: 'hidden',
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
              onClick={() => router.push('/rms/platforms-devices')}
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
        <Box
          sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#888' }}
        >
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
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold', width: 40 }}></TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Platform Number</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Platform Type</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Subnet</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {platforms.map((platform, index) => {
                const isExpanded = expandedPlatformIndex === index;
                return (
                  <React.Fragment key={platform.PlatformNumber}>
                    <TableRow
                      sx={{
                        cursor: 'pointer',
                        bgcolor: isExpanded ? '#2a2a2a' : 'inherit',
                        '&:hover': { bgcolor: '#2a2a2a' },
                      }}
                      onClick={() => toggleExpand(index)}
                    >
                      <TableCell sx={{ color: '#ccc', width: 40 }}>
                        <IconButton size="small" onClick={() => toggleExpand(index)}>
                          {isExpanded ? (
                            <KeyboardArrowUpIcon sx={{ color: '#90CAF9' }} />
                          ) : (
                            <KeyboardArrowDownIcon sx={{ color: '#90CAF9' }} />
                          )}
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ color: '#E0E0E0' }}>{platform.PlatformNumber}</TableCell>
                      <TableCell sx={{ color: '#E0E0E0' }}>{platform.PlatformType}</TableCell>
                      <TableCell sx={{ color: '#E0E0E0' }}>{platform.Subnet}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} sx={{ p: 0, bgcolor: '#121212' }}>
                        <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 1 }}>
                            <Typography variant="subtitle2" sx={{ color: '#90CAF9', mb: 1 }}>
                              Devices
                            </Typography>
                            {platform.Devices.length === 0 ? (
                              <Typography sx={{ color: '#888', fontStyle: 'italic' }}>
                                No devices available
                              </Typography>
                            ) : (
                              <Table size="small" aria-label="devices table" sx={{ bgcolor: '#222' }}>
                                <TableHead>
                                  <TableRow>
                                    <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>
                                      Device Type
                                    </TableCell>
                                    <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>
                                      IP Address
                                    </TableCell>
                                    <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Status</TableCell>
                                    <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>
                                      Timestamp
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {platform.Devices.map((device) => (
                                    <TableRow key={device.Id} hover>
                                      <TableCell sx={{ color: '#E0E0E0' }}>{device.DeviceType}</TableCell>
                                      <TableCell sx={{ color: '#ccc' }}>{device.IpAddress}</TableCell>
                                      <TableCell
                                        sx={{
                                          color: device.Status ? '#4caf50' : '#f44336',
                                          fontWeight: 'bold',
                                        }}
                                      >
                                        {device.Status ? 'OK' : 'Err'}
                                      </TableCell>
                                      <TableCell sx={{ color: '#ccc' }}>
                                        {new Date(device.LastStatusWhen).toLocaleString()}
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}
