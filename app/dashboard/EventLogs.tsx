'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Button,
  Stack,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';

interface EventLog {
  _id: string;
  Timestamp: string;
  EventID: number;
  EventType: string;
  Source: string;
  Description?: string;
  IsSentToServer: boolean;
}

const FIXED_STATION_CODE = 'NDLS';

export default function EventLogs() {
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/rms/event-logs?stationCode=${FIXED_STATION_CODE}`, {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      });
      const json = await res.json();

      if (json.success) {
        setLogs(json.data);
      } else {
        setError(json.message || 'Failed to fetch event logs');
      }
    } catch {
      setError('Network error while fetching event logs');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEventLogs();
  }, []);

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

  return (
    <Box sx={{ maxWidth: '100%', mx: 'auto', mt: 0, px: 0, height: '100%' }}>
      <Card
        sx={{
          bgcolor: '#121212',
          borderRadius: 3,
          border: '1px solid #90CAF9',
          p: 1,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardHeader
          title={
            <Typography
              variant="h5"
              sx={{ color: '#90CAF9', textAlign: 'center', fontWeight: 'bold' }}
            >
              Event Logs for Station: {FIXED_STATION_CODE}
            </Typography>
          }
          action={
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                aria-label="refresh"
                onClick={fetchEventLogs}
                sx={{ color: '#90CAF9' }}
                disabled={loading}
              >
                <RefreshIcon />
              </IconButton>
              <Button
                variant="contained"
                color="primary"
                startIcon={<DownloadIcon />}
                onClick={downloadCSV}
                disabled={loading || logs.length === 0}
              >
                Download All
              </Button>
            </Stack>
          }
          sx={{ pb: 2 }}
        />

        {/* Content area fills remaining height */}
        <Box
          sx={{
            flexGrow: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {loading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexGrow: 1,
              }}
            >
              <CircularProgress sx={{ color: '#90CAF9' }} />
            </Box>
          ) : error ? (
            <Typography sx={{ color: 'error.main', textAlign: 'center', py: 8 }}>
              {error}
            </Typography>
          ) : logs.length === 0 ? (
            <Typography sx={{ color: '#888', textAlign: 'center', py: 8 }}>
              No event logs found
            </Typography>
          ) : (
            <TableContainer
              component={Paper}
              sx={{
                bgcolor: 'transparent',
                flexGrow: 1,
                overflowY: 'auto',
                borderRadius: 2,
                boxShadow: 'none',
                m: 0,
                '&::-webkit-scrollbar': { width: '8px' },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: '#555',
                  borderRadius: '4px',
                },
              }}
            >
              <Table
                stickyHeader
                size="small"
                aria-label="event logs table"
                sx={{ tableLayout: 'fixed', width: '100%' }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold', width: '10%' }}>
                      Event ID
                    </TableCell>
                    <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold', width: '20%' }}>
                      Timestamp
                    </TableCell>
                    <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold', width: '15%' }}>
                      Type
                    </TableCell>
                    <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold', width: '15%' }}>
                      Source
                    </TableCell>
                    <TableCell
                      sx={{
                        color: '#90CAF9',
                        fontWeight: 'bold',
                        width: '30%',
                        overflowWrap: 'break-word',
                      }}
                    >
                      Description
                    </TableCell>
                    <TableCell sx={{ color: '#90CAF9', fontWeight: 'bold', width: '10%' }}>
                      Sent To Server
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log._id} hover>
                      <TableCell sx={{ color: '#E0E0E0' }}>{log.EventID}</TableCell>
                      <TableCell sx={{ color: '#E0E0E0' }}>
                        {new Date(log.Timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ color: '#E0E0E0' }}>{log.EventType}</TableCell>
                      <TableCell sx={{ color: '#E0E0E0' }}>{log.Source}</TableCell>
                      <TableCell
                        sx={{
                          color: '#E0E0E0',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                        }}
                      >
                        {log.Description || '-'}
                      </TableCell>
                      <TableCell sx={{ color: '#E0E0E0' }}>
                        {log.IsSentToServer ? 'Yes' : 'No'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      </Card>
    </Box>
  );
}
