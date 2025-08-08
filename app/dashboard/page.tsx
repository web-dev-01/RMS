'use client';

import React, { useState, useEffect } from 'react';
import Template from './Template';
import {
  Box, Typography, Card, Table, TableHead, TableRow, TableCell, TableBody,
  CardContent, Button, Grid, CircularProgress, Alert, Chip,
} from '@mui/material';
import { useRouter } from 'next/navigation';

// Types based on schemas
type Station = {
  _id?: string;
  StationCode: string;
  StationNameEnglish: string;
  RegionalLanguage: string;
  NumberOfPlatforms?: number;
};

type Train = {
  _id?: string;
  TrainNumber: string;
  TrainNameEnglish: string;
  Status: 'On Time' | 'Delayed' | 'Canceled';
  TypeAorD: 'A' | 'D';
};

type Device = {
  DeviceType: 'Display' | 'Speaker' | 'Other';
  Status: boolean;
};

type Platform = {
  PlatformNumber: string;
  Devices: Device[];
};

type PlatformDevice = {
  _id?: string;
  stationName: string;
  platforms: Platform[];
};

type EventLog = {
  _id?: string;
  Timestamp: string;
  EventID: number;
  EventType: string;
  Description?: string;
};

type CapAlert = {
  identifier: string;
  status: 'Active' | 'Expired';
  info: {
    event: string;
    severity: string;
  }[];
};

export default function Dashboard() {
  const router = useRouter();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [station, setStation] = useState<Station | null>(null);
  const [activeTrains, setActiveTrains] = useState<Train[]>([]);
  const [platformsDevices, setPlatformsDevices] = useState<PlatformDevice[]>([]);
  const [eventLogs, setEventLogs] = useState<EventLog[]>([]);
  const [capAlerts, setCapAlerts] = useState<CapAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [stationRes, trainsRes, platformsRes, logsRes, alertsRes] = await Promise.all([
          fetch('/api/rms/station-info').catch(() => ({ ok: false })),
          fetch('/api/rms/active-trains').catch(() => ({ ok: false })),
          fetch('/api/rms/platforms-devices').catch(() => ({ ok: false })),
          fetch('/api/rms/event-logs').catch(() => ({ ok: false })),
          fetch('/api/rms/cap-alerts').catch(() => ({ ok: false }))
        ]);

        if (stationRes.ok) {
          const data = await stationRes.json();
          setStation(data.success ? data.data[0] : (Array.isArray(data) ? data[0] : data));
        }

        if (trainsRes.ok) {
          const data = await trainsRes.json();
          setActiveTrains(data.success ? data.data.slice(0, 8) : (Array.isArray(data) ? data.slice(0, 8) : []));
        }

        if (platformsRes.ok) {
          const data = await platformsRes.json();
          setPlatformsDevices(data.success ? data.data : (Array.isArray(data) ? data : []));
        }

        if (logsRes.ok) {
          const data = await logsRes.json();
          const logs = data.success ? data.data : (Array.isArray(data) ? data : []);
          setEventLogs(logs.slice(0, 8).sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()));
        }

        if (alertsRes.ok) {
          const data = await alertsRes.json();
          const alerts = data.success ? data.data : (Array.isArray(data) ? data : []);
          setCapAlerts(alerts.filter(alert => alert.status === 'Active').slice(0, 8));
        }

      } catch (err) {
        setError('Failed to fetch data. Check API endpoints.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
      
      fetch('/api/rms/active-trains')
        .then(res => res.json())
        .then(data => {
          const trains = data.success ? data.data : (Array.isArray(data) ? data : []);
          setActiveTrains(trains.slice(0, 8));
        })
        .catch(() => {});

      fetch('/api/rms/event-logs')
        .then(res => res.json())
        .then(data => {
          const logs = data.success ? data.data : (Array.isArray(data) ? data : []);
          setEventLogs(logs.slice(0, 8).sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime()));
        })
        .catch(() => {});
        
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'on time': return '#4CAF50';
      case 'delayed': return '#FF9800';
      case 'canceled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'severe': return '#F44336';
      case 'moderate': return '#FF9800';
      case 'minor': return '#FFC107';
      default: return '#2196F3';
    }
  };

  if (loading) {
    return (
      <Template>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', bgcolor: '#0A0F19' }}>
          <CircularProgress size={60} sx={{ color: '#00ED64' }} />
        </Box>
      </Template>
    );
  }

  if (error) {
    return (
      <Template>
        <Box sx={{ p: 4, bgcolor: '#0A0F19', minHeight: '100vh' }}>
          <Alert severity="error" sx={{ color: '#FF6B6B', bgcolor: 'rgba(255, 107, 107, 0.1)' }}>{error}</Alert>
        </Box>
      </Template>
    );
  }

  return (
    <Template>
      <Box sx={{ minHeight: '100vh', bgcolor: '#0A0F19', p: 3 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" sx={{ color: '#00ED64', fontWeight: 700, mb: 1 }}>
            IPIS Management Dashboard
          </Typography>
          <Typography sx={{ color: '#8B9DC3', mb: 2 }}>
            Last updated: {lastUpdated.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata' })}
          </Typography>
        </Box>

        {/* Station Info */}
        <Card sx={{ mb: 4, bgcolor: 'rgba(32, 31, 34, 0.9)', borderRadius: 2, border: '1px solid rgba(0, 237, 100, 0.2)' }}>
          <CardContent>
            <Typography variant="h6" sx={{ color: '#00ED64', mb: 2, fontWeight: 600 }}>🚉 Station Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={3}><Typography sx={{ color: '#8B9DC3' }}>Name</Typography><Typography sx={{ color: '#FFFFFF' }}>{station?.StationNameEnglish || 'N/A'}</Typography></Grid>
              <Grid item xs={3}><Typography sx={{ color: '#8B9DC3' }}>Code</Typography><Typography sx={{ color: '#FFFFFF' }}>{station?.StationCode || 'N/A'}</Typography></Grid>
              <Grid item xs={3}><Typography sx={{ color: '#8B9DC3' }}>Language</Typography><Typography sx={{ color: '#FFFFFF' }}>{station?.RegionalLanguage || 'N/A'}</Typography></Grid>
              <Grid item xs={3}><Typography sx={{ color: '#8B9DC3' }}>Platforms</Typography><Typography sx={{ color: '#FFFFFF' }}>{station?.NumberOfPlatforms || 'N/A'}</Typography></Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Dashboard Grid */}
        <Grid container spacing={3}>
          {/* Active Trains */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'rgba(32, 31, 34, 0.9)', borderRadius: 2, height: 380, border: '1px solid rgba(0, 237, 100, 0.2)' }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ color: '#00ED64', mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  🚂 Active Trains <Chip label={activeTrains.length} size="small" sx={{ ml: 1, bgcolor: '#00ED64', color: '#0A0F19' }} />
                </Typography>
                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#8B9DC3', fontWeight: 600, border: 'none' }}>Train</TableCell>
                        <TableCell sx={{ color: '#8B9DC3', fontWeight: 600, border: 'none' }}>Number</TableCell>
                        <TableCell sx={{ color: '#8B9DC3', fontWeight: 600, border: 'none' }}>Status</TableCell>
                        <TableCell sx={{ color: '#8B9DC3', fontWeight: 600, border: 'none' }}>Type</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {activeTrains.length > 0 ? activeTrains.map((train) => (
                        <TableRow key={train._id} sx={{ '&:hover': { bgcolor: 'rgba(0, 237, 100, 0.05)' } }}>
                          <TableCell sx={{ color: '#FFFFFF', border: 'none', py: 1 }}>{train.TrainNameEnglish.substring(0, 15)}{train.TrainNameEnglish.length > 15 ? '...' : ''}</TableCell>
                          <TableCell sx={{ color: '#FFFFFF', border: 'none', py: 1 }}>{train.TrainNumber}</TableCell>
                          <TableCell sx={{ border: 'none', py: 1 }}><Chip label={train.Status} size="small" sx={{ bgcolor: getStatusColor(train.Status), color: 'white', fontSize: '0.75rem' }} /></TableCell>
                          <TableCell sx={{ color: '#FFFFFF', border: 'none', py: 1 }}>{train.TypeAorD === 'A' ? 'Arrival' : 'Departure'}</TableCell>
                        </TableRow>
                      )) : (
                        <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', color: '#8B9DC3', py: 3, border: 'none' }}>No active trains</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
                <Button variant="contained" sx={{ mt: 2, bgcolor: '#00ED64', color: '#0A0F19', '&:hover': { bgcolor: '#00C653' } }} onClick={() => router.push('/rms/active-trains')}>View All</Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Platform Devices */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'rgba(32, 31, 34, 0.9)', borderRadius: 2, height: 380, border: '1px solid rgba(0, 237, 100, 0.2)' }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ color: '#00ED64', mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  🖥️ Devices <Chip label={platformsDevices.reduce((acc, pd) => acc + pd.platforms.length, 0)} size="small" sx={{ ml: 1, bgcolor: '#00ED64', color: '#0A0F19' }} />
                </Typography>
                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#8B9DC3', fontWeight: 600, border: 'none' }}>Platform</TableCell>
                        <TableCell sx={{ color: '#8B9DC3', fontWeight: 600, border: 'none' }}>Displays</TableCell>
                        <TableCell sx={{ color: '#8B9DC3', fontWeight: 600, border: 'none' }}>Speakers</TableCell>
                        <TableCell sx={{ color: '#8B9DC3', fontWeight: 600, border: 'none' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {platformsDevices.length > 0 ? platformsDevices.flatMap((pd) =>
                        pd.platforms.slice(0, 6).map((platform) => {
                          const displays = platform.Devices.filter(d => d.DeviceType === 'Display');
                          const speakers = platform.Devices.filter(d => d.DeviceType === 'Speaker');
                          const online = platform.Devices.filter(d => d.Status).length;
                          const total = platform.Devices.length;
                          return (
                            <TableRow key={`${pd._id}-${platform.PlatformNumber}`} sx={{ '&:hover': { bgcolor: 'rgba(0, 237, 100, 0.05)' } }}>
                              <TableCell sx={{ color: '#FFFFFF', border: 'none', py: 1 }}>{platform.PlatformNumber}</TableCell>
                              <TableCell sx={{ color: '#FFFFFF', border: 'none', py: 1 }}>{displays.length}</TableCell>
                              <TableCell sx={{ color: '#FFFFFF', border: 'none', py: 1 }}>{speakers.length}</TableCell>
                              <TableCell sx={{ border: 'none', py: 1 }}><Chip label={`${online}/${total}`} size="small" sx={{ bgcolor: online === total ? '#4CAF50' : online > 0 ? '#FF9800' : '#F44336', color: 'white', fontSize: '0.75rem' }} /></TableCell>
                            </TableRow>
                          );
                        })
                      ) : (
                        <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', color: '#8B9DC3', py: 3, border: 'none' }}>No platforms</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
                <Button variant="contained" sx={{ mt: 2, bgcolor: '#00ED64', color: '#0A0F19', '&:hover': { bgcolor: '#00C653' } }} onClick={() => router.push('/rms/platforms-devices')}>Manage</Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Event Logs */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'rgba(32, 31, 34, 0.9)', borderRadius: 2, height: 380, border: '1px solid rgba(0, 237, 100, 0.2)' }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ color: '#00ED64', mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  📋 Event Logs <Chip label={eventLogs.length} size="small" sx={{ ml: 1, bgcolor: '#00ED64', color: '#0A0F19' }} />
                </Typography>
                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#8B9DC3', fontWeight: 600, border: 'none' }}>Time</TableCell>
                        <TableCell sx={{ color: '#8B9DC3', fontWeight: 600, border: 'none' }}>Event</TableCell>
                        <TableCell sx={{ color: '#8B9DC3', fontWeight: 600, border: 'none' }}>Type</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {eventLogs.length > 0 ? eventLogs.map((log) => (
                        <TableRow key={log.EventID} sx={{ '&:hover': { bgcolor: 'rgba(0, 237, 100, 0.05)' } }}>
                          <TableCell sx={{ color: '#FFFFFF', border: 'none', py: 1 }}>{new Date(log.Timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                          <TableCell sx={{ color: '#FFFFFF', border: 'none', py: 1 }}>{log.Description ? (log.Description.length > 20 ? log.Description.substring(0, 20) + '...' : log.Description) : `Event ${log.EventID}`}</TableCell>
                          <TableCell sx={{ border: 'none', py: 1 }}><Chip label={log.EventType} size="small" sx={{ bgcolor: log.EventType === 'Error' ? '#F44336' : log.EventType === 'Warning' ? '#FF9800' : '#2196F3', color: 'white', fontSize: '0.75rem' }} /></TableCell>
                        </TableRow>
                      )) : (
                        <TableRow><TableCell colSpan={3} sx={{ textAlign: 'center', color: '#8B9DC3', py: 3, border: 'none' }}>No logs</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
                <Button variant="contained" sx={{ mt: 2, bgcolor: '#00ED64', color: '#0A0F19', '&:hover': { bgcolor: '#00C653' } }} onClick={() => router.push('/rms/activity-log')}>View All</Button>
              </CardContent>
            </Card>
          </Grid>

          {/* CAP Alerts */}
          <Grid item xs={12} md={6}>
            <Card sx={{ bgcolor: 'rgba(32, 31, 34, 0.9)', borderRadius: 2, height: 380, border: '1px solid rgba(0, 237, 100, 0.2)' }}>
              <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6" sx={{ color: '#00ED64', mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  🚨 CAP Alerts <Chip label={capAlerts.length} size="small" sx={{ ml: 1, bgcolor: '#00ED64', color: '#0A0F19' }} />
                </Typography>
                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: '#8B9DC3', fontWeight: 600, border: 'none' }}>ID</TableCell>
                        <TableCell sx={{ color: '#8B9DC3', fontWeight: 600, border: 'none' }}>Event</TableCell>
                        <TableCell sx={{ color: '#8B9DC3', fontWeight: 600, border: 'none' }}>Severity</TableCell>
                        <TableCell sx={{ color: '#8B9DC3', fontWeight: 600, border: 'none' }}>Status</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {capAlerts.length > 0 ? capAlerts.map((alert) => (
                        <TableRow key={alert.identifier} sx={{ '&:hover': { bgcolor: 'rgba(0, 237, 100, 0.05)' } }}>
                          <TableCell sx={{ color: '#FFFFFF', border: 'none', py: 1 }}>{alert.identifier.substring(0, 8)}</TableCell>
                          <TableCell sx={{ color: '#FFFFFF', border: 'none', py: 1 }}>{alert.info[0]?.event ? (alert.info[0].event.length > 15 ? alert.info[0].event.substring(0, 15) + '...' : alert.info[0].event) : 'N/A'}</TableCell>
                          <TableCell sx={{ border: 'none', py: 1 }}><Chip label={alert.info[0]?.severity || 'Unknown'} size="small" sx={{ bgcolor: getSeverityColor(alert.info[0]?.severity), color: 'white', fontSize: '0.75rem' }} /></TableCell>
                          <TableCell sx={{ border: 'none', py: 1 }}><Chip label={alert.status} size="small" sx={{ bgcolor: alert.status === 'Active' ? '#2196F3' : '#757575', color: 'white', fontSize: '0.75rem' }} /></TableCell>
                        </TableRow>
                      )) : (
                        <TableRow><TableCell colSpan={4} sx={{ textAlign: 'center', color: '#8B9DC3', py: 3, border: 'none' }}>No alerts</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
                <Button variant="contained" sx={{ mt: 2, bgcolor: '#00ED64', color: '#0A0F19', '&:hover': { bgcolor: '#00C653' } }} onClick={() => router.push('/rms/cap-alerts')}>View All</Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Footer */}
        <Box sx={{ mt: 4, textAlign: 'center', p: 2, bgcolor: 'rgba(32, 31, 34, 0.9)', borderRadius: 2 }}>
          <Typography sx={{ color: '#00ED64' }}>© {new Date().getFullYear()} Indian Railways</Typography>
        </Box>
      </Box>
    </Template>
  );
}