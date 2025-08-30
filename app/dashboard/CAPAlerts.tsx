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

interface Area {
  areaDesc: string;
}

interface Info {
  category: string;
  event: string;
  urgency: string;
  severity: string;
  certainty: string;
  headline: string;
  description: string;
  effective: string;
  expires: string;
  area: Area[];
}

interface CapAlert {
  _id: string;
  stationCode: string;
  identifier: string;
  sender: string;
  sent: string;
  status: string;
  msgType: string;
  source: string;
  scope: string;
  info: Info;
}

export default function CapAlerts() {
  const [alerts, setAlerts] = useState<CapAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch ALL alerts (no stationCode parameter)
      const res = await fetch('/api/rms/cap-alerts', {
        headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '' },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAlerts(json.data.slice(0, 10)); // top 10 alerts only for dashboard display
      } else {
        setAlerts([]);
        setError(json.message || 'No CAP alerts found');
      }
    } catch (err) {
      setError('Failed to fetch CAP alerts');
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Download handler
  const handleDownload = () => {
    const dataStr = JSON.stringify(alerts, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CAP_Alerts_All_Stations_${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <Card
      sx={{
        bgcolor: '#1E1E1E',
        borderRadius: 2,
        border: '1px solid #90CAF9',
        height: '400px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" sx={{ color: '#90CAF9', textAlign: 'center' }}>
            CAP Alerts (for this Station)
          </Typography>
        }
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              aria-label="refresh"
              onClick={fetchAlerts}
              sx={{ color: '#90CAF9' }}
              disabled={loading}
            >
              <RefreshIcon />
            </IconButton>
            <Button
              variant="contained"
              size="small"
              sx={{ bgcolor: '#c2d8e9', '&:hover': { bgcolor: '#388e3c' } }}
              onClick={() => router.push('/rms/cap-alerts')}
            >
              View All
            </Button>
            <Button
              variant="contained"
              size="small"
              sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
              onClick={handleDownload}
              disabled={alerts.length === 0}
            >
              Download
            </Button>
          </Box>
        }
        sx={{ pb: 1 }}
      />

      {loading ? (
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress size={28} sx={{ color: '#90CAF9' }} />
        </Box>
      ) : error ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#ff6f6f',
          }}
        >
          {error}
        </Box>
      ) : alerts.length === 0 ? (
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#888',
          }}
        >
          No CAP alerts found
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            bgcolor: 'transparent',
            flex: 1,
            overflowY: 'auto',
            width: '100%',
            mx: 0,
            px: 0,
            boxShadow: 'none',
            '&::-webkit-scrollbar': { width: '6px' },
            '&::-webkit-scrollbar-thumb': { backgroundColor: '#555', borderRadius: '3px' },
          }}
        >
          <Table size="small" stickyHeader sx={{ width: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Station</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Identifier</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Sender</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Sent</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Message Type</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Urgency</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Severity</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Certainty</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert._id} sx={{ '&:hover': { backgroundColor: '#2a2a2a' } }}>
                  <TableCell sx={{ color: '#E0E0E0' }}>{alert.stationCode}</TableCell>
                  <TableCell sx={{ color: '#E0E0E0' }}>{alert.identifier}</TableCell>
                  <TableCell sx={{ color: '#ccc' }}>{alert.sender}</TableCell>
                  <TableCell sx={{ color: '#ccc' }}>{new Date(alert.sent).toLocaleString()}</TableCell>
                  <TableCell sx={{ color: '#ccc' }}>{alert.status}</TableCell>
                  <TableCell sx={{ color: '#ccc' }}>{alert.msgType}</TableCell>
                  <TableCell sx={{ color: '#ff4444', fontWeight: 'bold' }}>{alert.info.urgency}</TableCell>
                  <TableCell sx={{ color: '#ff4444', fontWeight: 'bold' }}>{alert.info.severity}</TableCell>
                  <TableCell sx={{ color: '#ff4444', fontWeight: 'bold' }}>{alert.info.certainty}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}