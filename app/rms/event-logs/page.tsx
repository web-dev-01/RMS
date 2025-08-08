'use client';

import React, { useEffect, useState } from 'react';
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
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { formatDistanceToNow } from 'date-fns';

// Define interface for event log data
interface EventLog {
  _id?: string;
  EventID: number;
  EventType: 'Information' | 'Warning' | 'Error' | 'Critical';
  Source: string;
  Description: string;
  Timestamp: string;
  IsSentToServer: boolean;
}

export default function EventLogsPage() {
  // State for logs, loading, error, and selected log for dialog
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<EventLog | null>(null);

  // Define color scheme to match PlatformsDevicesPage
  const primaryColor = '#00ED64'; // MongoDB green
  const secondaryColor = '#0A0F19'; // Dark navy

  // Fetch event logs from API
  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/rms/event-logs');
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      const data = await res.json();
      // Ensure logs is an array to prevent undefined errors
      setLogs(Array.isArray(data?.data) ? data.data : []);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Failed to fetch event logs');
    } finally {
      setLoading(false);
    }
  };

  // Fetch logs on component mount
  useEffect(() => {
    fetchLogs();
  }, []);

  // Handle click on a log row to show details in dialog
  const handleLogClick = (log: EventLog) => {
    setSelectedLog(log);
  };

  // Close the log details dialog
  const handleCloseDialog = () => {
    setSelectedLog(null);
  };

  return (
    <Box sx={{ p: 4, bgcolor: secondaryColor, minHeight: '100vh' }}>
      {/* Header with title and refresh button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: primaryColor }}>
          Event Logs
        </Typography>
        <Tooltip title="Refresh Logs">
          <IconButton
            onClick={fetchLogs}
            sx={{ color: primaryColor, '&:hover': { bgcolor: '#00ED6420' } }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Main content */}
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
          // Show loading spinner during fetch
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress size={60} sx={{ color: primaryColor }} />
          </Box>
        ) : error ? (
          // Show error message if fetch fails
          <Alert
            severity="error"
            sx={{ borderRadius: 2, bgcolor: secondaryColor, color: primaryColor }}
          >
            {error}
          </Alert>
        ) : logs.length === 0 ? (
          // Show info message if no logs exist
          <Alert
            severity="info"
            sx={{ borderRadius: 2, bgcolor: secondaryColor, color: primaryColor }}
          >
            No logs found.
          </Alert>
        ) : (
          // Display logs in a clickable table
          <Table>
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
              {logs.map((log) => (
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
                  <TableCell sx={{ color: primaryColor }}>{log.Description || 'N/A'}</TableCell>
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

      {/* Dialog for log details */}
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
                {selectedLog.Timestamp
                  ? new Date(selectedLog.Timestamp).toLocaleString()
                  : 'N/A'}
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
  );
}