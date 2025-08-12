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
  const stationCode = 'NDLS'; // fixed station code
  const [alerts, setAlerts] = useState<CapAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rms/cap-alerts?stationCode=${stationCode}`, {
        headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '' },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setAlerts(json.data.slice(0, 10)); // top 10 alerts only for display
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

  // Download all CAP alerts as CSV
  const downloadAllAlerts = async () => {
    try {
      const res = await fetch(`/api/rms/cap-alerts?stationCode=${stationCode}`, {
        headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '' },
      });
      const json = await res.json();

      if (!json.success || !Array.isArray(json.data)) {
        alert('No data available for download');
        return;
      }

      const allAlerts = json.data;

      // Prepare CSV headers
      const headers = [
        'ID',
        'Station Code',
        'Identifier',
        'Sender',
        'Sent',
        'Status',
        'Message Type',
        'Source',
        'Scope',
        'Category',
        'Event',
        'Urgency',
        'Severity',
        'Certainty',
        'Headline',
        'Description',
        'Effective',
        'Expires',
        'Areas',
      ];

      // Convert alert data to CSV rows
      const rows = allAlerts.map((alert: CapAlert) => [
        alert._id,
        alert.stationCode,
        alert.identifier,
        alert.sender,
        alert.sent,
        alert.status,
        alert.msgType,
        alert.source,
        alert.scope,
        alert.info.category,
        alert.info.event,
        alert.info.urgency,
        alert.info.severity,
        alert.info.certainty,
        `"${alert.info.headline.replace(/"/g, '""')}"`, // quote and escape quotes inside text
        `"${alert.info.description.replace(/"/g, '""')}"`,
        alert.info.effective,
        alert.info.expires,
        `"${alert.info.area.map(a => a.areaDesc).join('; ').replace(/"/g, '""')}"`,
      ]);

      // Join headers and rows
      const csvContent =
        [headers, ...rows]
          .map((row) => row.join(','))
          .join('\n');

      // Create Blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CAP_Alerts_${stationCode}_${new Date().toISOString()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      alert('Failed to download CAP alerts');
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [stationCode]);

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
            CAP Alerts ({stationCode})
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
              onClick={() => router.push('/cap-alerts')}
            >
              View All
            </Button>
            <Button
              variant="outlined"
              size="small"
              sx={{
                color: '#90CAF9',
                borderColor: '#90CAF9',
                '&:hover': {
                  bgcolor: '#90CAF9',
                  color: '#193f11',
                  borderColor: '#90CAF9',
                },
              }}
              onClick={downloadAllAlerts}
              disabled={loading}
            >
              Download All
            </Button>
          </Box>
        }
        sx={{ pb: 1}}
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
          No CAP alerts for {stationCode}
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
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Headline</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Event</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Urgency</TableCell>
                <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold' }}>Severity</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert._id} sx={{ '&:hover': { backgroundColor: '#2a2a2a' } }}>
                  <TableCell
                    sx={{
                      color: '#E0E0E0',
                      maxWidth: 180,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    title={alert.info.headline}
                  >
                    {alert.info.headline}
                  </TableCell>
                  <TableCell sx={{ color: '#ccc' }}>{alert.info.event}</TableCell>
                  <TableCell sx={{ color: '#ccc' }}>{alert.info.category}</TableCell>
                  <TableCell sx={{ color: '#ff4444', fontWeight: 'bold' }}>{alert.info.urgency}</TableCell>
                  <TableCell sx={{ color: '#ff4444', fontWeight: 'bold' }}>{alert.info.severity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  );
}
