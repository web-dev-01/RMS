'use client';

import React, { useEffect, useState } from 'react';
import Template from '@/app/dashboard/Template';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Stack,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import { formatDistanceToNow } from 'date-fns';

interface EventLog {
  _id?: string;
  EventID: number;
  EventType: 'Information' | 'Warning' | 'Error' | 'Critical' | string;
  Source: string;
  Description: string;
  Timestamp: string;
  IsSentToServer: boolean;
}

const FIXED_STATION_CODE = 'NDLS';

export default function EventLogsPage() {
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<EventLog | null>(null);

  // Colors for your theme
  const primaryColor = '#00ED64'; // MongoDB green
  const secondaryColor = '#0A0F19'; // Dark navy

  // Fetch event logs with API key and stationCode param
  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/rms/event-logs?stationCode=${FIXED_STATION_CODE}`, {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      });

      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const data = await res.json();

      if (data.success && Array.isArray(data.data)) {
        setLogs(data.data);
      } else {
        setError(data.message || 'Failed to fetch event logs');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Failed to fetch event logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // CSV generation based on logs
  const convertToCSV = (logs: EventLog[]) => {
    const headers = [
      'EventID',
      'Timestamp',
      'EventType',
      'Source',
      'Description',
      'IsSentToServer',
    ];

    const rows = logs.map(log => [
      log.EventID,
      `"${new Date(log.Timestamp).toISOString()}"`,
      `"${log.EventType}"`,
      `"${log.Source}"`,
      `"${log.Description ? log.Description.replace(/"/g, '""') : ''}"`,
      log.IsSentToServer ? 'Yes' : 'No',
    ]);

    return [headers, ...rows].map(e => e.join(',')).join('\n');
  };

  // Trigger CSV download
  const downloadCSV = () => {
    if (logs.length === 0) return;

    const csv = convertToCSV(logs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'event-logs.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogClick = (log: EventLog) => {
    setSelectedLog(log);
  };

  const handleCloseDialog = () => {
    setSelectedLog(null);
  };

  return (
    <Template>
      <Box sx={{ p: 4, bgcolor: secondaryColor, minHeight: '100vh' }}>
        {/* Header with title, refresh, download */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: primaryColor }}>
            Event Logs for Station: {FIXED_STATION_CODE}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Refresh Logs">
              <IconButton
                onClick={fetchLogs}
                sx={{ color: primaryColor, '&:hover': { bgcolor: '#00ED6420' } }}
                disabled={loading}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={downloadCSV}
              disabled={loading || logs.length === 0}
              sx={{ bgcolor: primaryColor, color: secondaryColor, '&:hover': { bgcolor: '#00CC55' } }}
            >
              Download All
            </Button>
          </Stack>
        </Box>

        {/* Main container */}
        <Paper
          elevation={3}
          sx={{
            p: 3,
            bgcolor: '#0A0F19CC',
            borderRadius: 2,
            '&:hover': { boxShadow: `0 4px 20px ${primaryColor}33` },
            transition: 'box-shadow 0.3s',
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress size={60} sx={{ color: primaryColor }} />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: 2, bgcolor: secondaryColor, color: primaryColor }}>
              {error}
            </Alert>
          ) : logs.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2, bgcolor: secondaryColor, color: primaryColor }}>
              No logs found.
            </Alert>
          ) : (
            <Table sx={{ tableLayout: 'fixed', wordWrap: 'break-word' }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: primaryColor, fontWeight: 'bold' }}>Event ID</TableCell>
                  <TableCell sx={{ color: primaryColor, fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell sx={{ color: primaryColor, fontWeight: 'bold' }}>Source</TableCell>
                  <TableCell sx={{ color: primaryColor, fontWeight: 'bold' }}>Description</TableCell>
                  <TableCell sx={{ color: primaryColor, fontWeight: 'bold' }}>Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map(log => (
                  <TableRow
                    key={log._id || log.EventID}
                    onClick={() => handleLogClick(log)}
                    sx={{
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#00ED6420' },
                      transition: 'background-color 0.2s',
                    }}
                  >
                    <TableCell sx={{ color: primaryColor }}>{log.EventID}</TableCell>
                    <TableCell sx={{ color: primaryColor }}>{log.EventType || 'N/A'}</TableCell>
                    <TableCell sx={{ color: primaryColor }}>{log.Source || 'N/A'}</TableCell>
                    <TableCell
                      sx={{
                        color: primaryColor,
                        maxWidth: 300,
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                      }}
                      title={log.Description || 'N/A'}
                    >
                      {log.Description || 'N/A'}
                    </TableCell>
                    <TableCell sx={{ color: primaryColor }}>
                      {log.Timestamp
                        ? formatDistanceToNow(new Date(log.Timestamp), { addSuffix: true })
                        : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>

        {/* Dialog for selected log details */}
        <Dialog
          open={!!selectedLog}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="sm"
          sx={{ '& .MuiDialog-paper': { borderRadius: 2, bgcolor: secondaryColor } }}
        >
          <DialogTitle sx={{ bgcolor: '#00ED6420', color: primaryColor, fontWeight: 'medium' }}>
            Event Log Details
          </DialogTitle>
          <DialogContent dividers sx={{ bgcolor: secondaryColor }}>
            {selectedLog && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography sx={{ color: primaryColor }}>
                  <strong>Event ID:</strong> {selectedLog.EventID}
                </Typography>
                <Typography sx={{ color: primaryColor }}>
                  <strong>Type:</strong> {selectedLog.EventType || 'N/A'}
                </Typography>
                <Typography sx={{ color: primaryColor }}>
                  <strong>Source:</strong> {selectedLog.Source || 'N/A'}
                </Typography>
                <Typography sx={{ color: primaryColor }}>
                  <strong>Description:</strong> {selectedLog.Description || 'N/A'}
                </Typography>
                <Typography sx={{ color: primaryColor }}>
                  <strong>Timestamp:</strong>{' '}
                  {selectedLog.Timestamp ? new Date(selectedLog.Timestamp).toLocaleString() : 'N/A'}
                </Typography>
                <Typography sx={{ color: primaryColor }}>
                  <strong>Sent to Server:</strong>{' '}
                  <Chip
                    label={selectedLog.IsSentToServer ? 'Yes' : 'No'}
                    sx={{
                      bgcolor: selectedLog.IsSentToServer ? primaryColor : '#999999',
                      color: secondaryColor,
                    }}
                    size="small"
                  />
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ bgcolor: '#0A0F19CC' }}>
            <Button
              onClick={handleCloseDialog}
              variant="contained"
              sx={{ bgcolor: primaryColor, color: secondaryColor, '&:hover': { bgcolor: '#00CC55' } }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Template>
  );
}
