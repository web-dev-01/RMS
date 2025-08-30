'use client';
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  Typography,
  Box,
  CircularProgress,
  Paper,
  IconButton,
  Button,
  Stack,
  Chip,
  Tooltip,
  Divider,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useRouter } from 'next/navigation';
import Template from '@/app/dashboard/Template';

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

  // Fetch all alerts from all stations
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
        setAlerts(json.data); // Show all alerts
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

  // Download all alerts as CSV
  const downloadAllAlerts = async () => {
    try {
      const res = await fetch('/api/rms/cap-alerts', {
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
        `"${alert.info.headline.replace(/"/g, '""')}"`,
        `"${alert.info.description.replace(/"/g, '""')}"`,
        alert.info.effective,
        alert.info.expires,
        `"${alert.info.area.map((a) => a.areaDesc).join('; ').replace(/"/g, '""')}"`,
      ]);

      // Join headers and rows
      const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');

      // Create Blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CAP_Alerts_All_Stations_${new Date().toISOString()}.csv`);
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
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'extreme':
        return 'error';
      case 'severe':
        return 'warning';
      case 'moderate':
        return 'info';
      case 'minor':
        return 'success';
      default:
        return 'default';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency.toLowerCase()) {
      case 'immediate':
        return 'error';
      case 'expected':
        return 'warning';
      case 'future':
        return 'info';
      case 'past':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <Template>
      <Box
        sx={{
          minHeight: 'calc(100vh - 80px)',
          p: 4,
          bgcolor: '#101111',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header & Actions */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography variant="h4" fontWeight={700} color="#90CAF9">
            CAP Alerts - All Stations
          </Typography>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              onClick={fetchAlerts}
              disabled={loading}
              sx={{ color: '#90CAF9' }}
              size="large"
              aria-label="refresh alerts"
            >
              <RefreshIcon fontSize="inherit" />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
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
              Download CSV
            </Button>
          </Box>
        </Box>

        {/* Alerts container */}
        <Paper
          sx={{
            bgcolor: '#1e1e1e',
            p: 2,
            borderRadius: 3,
            flex: 1,
            overflowY: 'auto',
            maxHeight: 'calc(100vh - 180px)',
            boxShadow: '0 0 20px rgba(144,202,249,0.2)',
          }}
          elevation={6}
        >
          {loading ? (
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <CircularProgress size={36} sx={{ color: '#90CAF9' }} />
            </Box>
          ) : error ? (
            <Typography
              variant="h6"
              color="error"
              sx={{ textAlign: 'center', mt: 4, fontWeight: 600 }}
            >
              {error}
            </Typography>
          ) : alerts.length === 0 ? (
            <Typography
              variant="h6"
              color="textSecondary"
              sx={{ textAlign: 'center', mt: 4 }}
            >
              No CAP alerts available
            </Typography>
          ) : (
            <Stack spacing={3}>
              {alerts.map((alert) => (
                <Card
                  key={alert._id}
                  sx={{
                    bgcolor: '#2A2A2A',
                    cursor: 'default',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      bgcolor: '#3A3A3A',
                      boxShadow: '0 6px 18px rgba(0,0,0,0.6)',
                      transform: 'translateY(-4px)',
                    },
                  }}
                  elevation={4}
                >
                  <CardHeader
                    title={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip
                          label={alert.stationCode}
                          size="small"
                          sx={{
                            bgcolor: '#90CAF9',
                            color: '#000',
                            fontWeight: 'bold',
                          }}
                        />
                        <Tooltip title={alert.info.headline}>
                          <Typography
                            variant="h6"
                            noWrap
                            sx={{ fontWeight: '700', color: '#E0E0E0', flex: 1 }}
                          >
                            {alert.info.headline}
                          </Typography>
                        </Tooltip>
                      </Box>
                    }
                    subheader={
                      <Typography
                        variant="caption"
                        sx={{ color: '#BBB', fontWeight: 500 }}
                      >
                        Sent: {new Date(alert.sent).toLocaleString()}
                      </Typography>
                    }
                    sx={{ pb: 0 }}
                  />

                  <Box sx={{ px: 3, pb: 3 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        color: '#CCC',
                        mb: 1,
                        whiteSpace: 'pre-line',
                      }}
                    >
                      {alert.info.description}
                    </Typography>

                    <Stack direction="row" spacing={2} flexWrap="wrap" mb={1}>
                      <Chip
                        label={`Category: ${alert.info.category}`}
                        size="medium"
                        sx={{ bgcolor: '#394867', color: '#BDD5EA', fontWeight: '600' }}
                      />
                      <Chip
                        label={`Event: ${alert.info.event}`}
                        size="medium"
                        sx={{ bgcolor: '#394867', color: '#BDD5EA', fontWeight: '600' }}
                      />
                    </Stack>

                    <Stack direction="row" spacing={2} flexWrap="wrap" mb={1}>
                      <Chip
                        label={`Urgency: ${alert.info.urgency}`}
                        size="medium"
                        color={getUrgencyColor(alert.info.urgency)}
                        sx={{ fontWeight: '700' }}
                      />
                      <Chip
                        label={`Severity: ${alert.info.severity}`}
                        size="medium"
                        color={getSeverityColor(alert.info.severity)}
                        sx={{ fontWeight: '700' }}
                      />
                      <Chip
                        label={`Certainty: ${alert.info.certainty}`}
                        size="medium"
                        sx={{ bgcolor: '#444', color: '#EEE', fontWeight: '700' }}
                      />
                    </Stack>

                    <Divider sx={{ my: 2, borderColor: '#555' }} />

                    <Typography
                      variant="body2"
                      sx={{ color: '#AAA', mb: 1 }}
                    >
                      <strong>Effective:</strong> {alert.info.effective} &nbsp;&nbsp;
                      <strong>Expires:</strong> {alert.info.expires}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{ color: '#AAA', mb: 2 }}
                    >
                      <strong>Areas Affected:</strong>{' '}
                      {alert.info.area.length > 0
                        ? alert.info.area.map((a) => a.areaDesc).join('; ')
                        : 'N/A'}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{ color: '#999' }}
                    >
                      Source: {alert.source || 'Unknown'}
                    </Typography>
                  </Box>
                </Card>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>
    </Template>
  );
}