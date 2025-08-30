'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  TableSortLabel,
  TablePagination,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Snackbar,
  Chip,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ClearIcon from '@mui/icons-material/Clear';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { styled } from '@mui/material/styles';
import Template from '@/app/dashboard/Template';

// Interface
interface EventLog {
  _id: string;
  Timestamp: string;
  EventID: number;
  EventType: 'Information' | 'Warning' | 'Error' | 'Critical' | string;
  Source: string;
  Description?: string;
  IsSentToServer: boolean;
}

// Styled Components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: '#121212',
  borderRadius: theme.shape.borderRadius,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  maxHeight: 'calc(100vh - 250px)',
  overflowY: 'auto',
  '&::-webkit-scrollbar': { width: '8px' },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: '#555',
    borderRadius: '4px',
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  cursor: 'pointer',
  '&:hover': { backgroundColor: '#90CAF920' },
  transition: theme.transitions.create(['background-color'], {
    duration: theme.transitions.duration.short,
  }),
}));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: '#121212',
    borderRadius: theme.shape.borderRadius,
    color: '#E0E0E0',
    border: `1px solid #90CAF9`,
  },
}));

// Main Component
export default function EventLogsPage() {
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<EventLog | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('All');
  const [sortBy, setSortBy] = useState<keyof EventLog>('Timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string }>({
    open: false,
    message: '',
  });

  // Colors from working code
  const primaryColor = '#90CAF9'; // Light blue
  const secondaryColor = '#121212'; // Dark background

  // Fetch event logs
  const fetchEventLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/rms/event-logs', {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      });
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      console.log('Event logs response:', json); // Debug log
      if (json.success && Array.isArray(json.data)) {
        setLogs(json.data);
      } else {
        setError(json.message || 'Failed to fetch event logs');
        setLogs([]);
      }
    } catch (err: any) {
      console.error('Error fetching event logs:', err);
      setError('Network error while fetching event logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch logs on mount
  useEffect(() => {
    fetchEventLogs();
  }, [fetchEventLogs]);

  // Sorting and Filtering Logic
  const filteredAndSortedLogs = useMemo(() => {
    let filtered = logs;
    if (searchQuery) {
      filtered = filtered.filter(
        log =>
          (log.Source?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
          (log.Description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      );
    }
    if (filterType !== 'All') {
      filtered = filtered.filter(log => log.EventType === filterType);
    }
    return filtered.sort((a, b) => {
      const aValue = a[sortBy] ?? '';
      const bValue = b[sortBy] ?? '';
      if (sortBy === 'Timestamp') {
        const aDate = parseISO(aValue as string);
        const bDate = parseISO(bValue as string);
        return sortOrder === 'asc' ? aDate.getTime() - bDate.getTime() : bDate.getTime() - aDate.getTime();
      }
      return sortOrder === 'asc'
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });
  }, [logs, searchQuery, filterType, sortBy, sortOrder]);

  // Pagination
  const paginatedLogs = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredAndSortedLogs.slice(start, start + rowsPerPage);
  }, [filteredAndSortedLogs, page, rowsPerPage]);

  // CSV Generation
  const convertToCSV = useCallback((logsToExport: EventLog[]): string => {
    const headers = [
      'EventID',
      'Timestamp',
      'EventType',
      'Source',
      'Description',
      'IsSentToServer',
    ];
    const rows = logsToExport.map(log => [
      log.EventID,
      `"${new Date(log.Timestamp).toISOString()}"`,
      `"${log.EventType || ''}"`,
      `"${log.Source || ''}"`,
      `"${log.Description ? log.Description.replace(/"/g, '""') : ''}"`,
      log.IsSentToServer ? 'Yes' : 'No',
    ]);
    return [headers, ...rows].map(e => e.join(',')).join('\n');
  }, []);

  // Download CSV
  const downloadCSV = useCallback(() => {
    if (filteredAndSortedLogs.length === 0) {
      setSnackbar({ open: true, message: 'No logs available to download' });
      return;
    }
    const csv = convertToCSV(filteredAndSortedLogs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `event_logs_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [filteredAndSortedLogs, convertToCSV]);

  // Copy to Clipboard
  const copyToClipboard = useCallback((text: string) => {
    navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Log details copied to clipboard' });
  }, []);

  // Handle Sorting
  const handleSort = useCallback((column: keyof EventLog) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  }, [sortBy, sortOrder]);

  // Handlers
  const handleLogClick = useCallback((log: EventLog) => {
    setSelectedLog(log);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setSelectedLog(null);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchQuery('');
    setFilterType('All');
    setPage(0);
  }, []);

  const handleChangePage = useCallback((_: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleChangeRowsPerPage = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }, []);

  // Event Type Colors
  const getEventTypeColor = useCallback((eventType: string) => {
    switch (eventType.toLowerCase()) {
      case 'critical':
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'information':
        return 'info';
      default:
        return 'default';
    }
  }, []);

  return (
    <Template>
      <Box sx={{ maxWidth: '100%', mx: 'auto', mt: 0, px: 4, height: '100%', bgcolor: secondaryColor, minHeight: '100vh' }}>
        <Card
          sx={{
            bgcolor: secondaryColor,
            borderRadius: 3,
            border: `1px solid ${primaryColor}`,
            p: 2,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
            transition: 'box-shadow 0.3s ease-in-out',
            '&:hover': { boxShadow: '0 6px 24px rgba(144, 202, 249, 0.2)' },
          }}
        >
          <CardHeader
            title={
              <Typography
                variant="h5"
                sx={{ color: primaryColor, textAlign: 'center', fontWeight: 'bold', letterSpacing: 1 }}
              >
                Event Logs
              </Typography>
            }
            action={
              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Refresh Logs">
                  <IconButton
                    aria-label="refresh"
                    onClick={fetchEventLogs}
                    sx={{ color: primaryColor, '&:hover': { bgcolor: '#90CAF920' } }}
                    disabled={loading}
                  >
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={downloadCSV}
                  disabled={loading || filteredAndSortedLogs.length === 0}
                  sx={{
                    bgcolor: primaryColor,
                    color: '#FFFFFF',
                    '&:hover': { bgcolor: '#64B5F6' },
                    textTransform: 'none',
                    fontWeight: 'medium',
                  }}
                  aria-label="Download all logs as CSV"
                >
                  Download All
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  disabled={loading || (!searchQuery && filterType === 'All')}
                  sx={{
                    color: primaryColor,
                    borderColor: primaryColor,
                    '&:hover': { bgcolor: '#90CAF920' },
                    textTransform: 'none',
                    fontWeight: 'medium',
                  }}
                  aria-label="Clear all filters"
                >
                  Clear Filters
                </Button>
              </Stack>
            }
            sx={{ pb: 2 }}
          />

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', px: 2 }}>
            <TextField
              label="Search by Source or Description"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{
                width: { xs: '100%', sm: 300 },
                bgcolor: '#1e1e1e',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': { borderColor: primaryColor },
                  '&:hover fieldset': { borderColor: '#64B5F6' },
                },
              }}
              InputProps={{ style: { color: '#E0E0E0' } }}
              InputLabelProps={{ style: { color: primaryColor } }}
              aria-label="Search logs"
            />
            <FormControl sx={{ width: { xs: '100%', sm: 200 }, bgcolor: '#1e1e1e', borderRadius: 1 }}>
              <InputLabel sx={{ color: primaryColor }}>Event Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                sx={{
                  color: '#E0E0E0',
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: primaryColor },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#64B5F6' },
                }}
                label="Event Type"
                aria-label="Filter by event type"
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="Information">Information</MenuItem>
                <MenuItem value="Warning">Warning</MenuItem>
                <MenuItem value="Error">Error</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Main Content */}
          <Box
            sx={{
              flexGrow: 1,
              minHeight: 0,
              display: 'flex',
              flexDirection: 'column',
              px: 2,
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
                <CircularProgress sx={{ color: primaryColor }} aria-label="Loading logs" />
              </Box>
            ) : error ? (
              <Alert
                severity="error"
                sx={{ borderRadius: 2, bgcolor: '#1e1e1e', color: primaryColor, m: 2 }}
              >
                {error}
              </Alert>
            ) : filteredAndSortedLogs.length === 0 ? (
              <Alert
                severity="info"
                sx={{ borderRadius: 2, bgcolor: '#1e1e1e', color: primaryColor, m: 2 }}
              >
                No event logs found
              </Alert>
            ) : (
              <>
                <StyledTableContainer>
                  <Table
                    stickyHeader
                    size="small"
                    aria-label="event logs table"
                    sx={{ tableLayout: 'fixed', width: '100%' }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ color: primaryColor, fontWeight: 'bold', width: '10%' }}>
                          <TableSortLabel
                            active={sortBy === 'EventID'}
                            direction={sortBy === 'EventID' ? sortOrder : 'asc'}
                            onClick={() => handleSort('EventID')}
                          >
                            Event ID
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ color: primaryColor, fontWeight: 'bold', width: '20%' }}>
                          <TableSortLabel
                            active={sortBy === 'Timestamp'}
                            direction={sortBy === 'Timestamp' ? sortOrder : 'asc'}
                            onClick={() => handleSort('Timestamp')}
                          >
                            Timestamp
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ color: primaryColor, fontWeight: 'bold', width: '15%' }}>
                          <TableSortLabel
                            active={sortBy === 'EventType'}
                            direction={sortBy === 'EventType' ? sortOrder : 'asc'}
                            onClick={() => handleSort('EventType')}
                          >
                            Type
                          </TableSortLabel>
                        </TableCell>
                        <TableCell sx={{ color: primaryColor, fontWeight: 'bold', width: '15%' }}>
                          <TableSortLabel
                            active={sortBy === 'Source'}
                            direction={sortBy === 'Source' ? sortOrder : 'asc'}
                            onClick={() => handleSort('Source')}
                          >
                            Source
                          </TableSortLabel>
                        </TableCell>
                        <TableCell
                          sx={{
                            color: primaryColor,
                            fontWeight: 'bold',
                            width: '30%',
                            overflowWrap: 'break-word',
                          }}
                        >
                          Description
                        </TableCell>
                        <TableCell sx={{ color: primaryColor, fontWeight: 'bold', width: '10%' }}>
                          Sent To Server
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginatedLogs.map((log) => (
                        <StyledTableRow
                          key={log._id}
                          hover
                          onClick={() => handleLogClick(log)}
                          role="row"
                        >
                          <TableCell sx={{ color: '#E0E0E0' }}>{log.EventID}</TableCell>
                          <TableCell sx={{ color: '#E0E0E0' }}>
                            {log.Timestamp
                              ? formatDistanceToNow(parseISO(log.Timestamp), { addSuffix: true })
                              : 'N/A'}
                          </TableCell>
                          <TableCell sx={{ color: '#E0E0E0' }}>
                            <Chip
                              label={log.EventType || 'N/A'}
                              color={getEventTypeColor(log.EventType)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell sx={{ color: '#E0E0E0' }}>{log.Source || 'N/A'}</TableCell>
                          <TableCell
                            sx={{
                              color: '#E0E0E0',
                              whiteSpace: 'normal',
                              wordBreak: 'break-word',
                            }}
                            title={log.Description || 'N/A'}
                          >
                            {log.Description || '-'}
                          </TableCell>
                          <TableCell sx={{ color: '#E0E0E0' }}>
                            <Chip
                              label={log.IsSentToServer ? 'Yes' : 'No'}
                              sx={{
                                bgcolor: log.IsSentToServer ? primaryColor : '#999999',
                                color: '#FFFFFF',
                              }}
                              size="small"
                            />
                          </TableCell>
                        </StyledTableRow>
                      ))}
                    </TableBody>
                  </Table>
                </StyledTableContainer>
                <TablePagination
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  component="div"
                  count={filteredAndSortedLogs.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  sx={{ color: primaryColor, bgcolor: '#1e1e1e' }}
                  aria-label="Table pagination"
                />
              </>
            )}
          </Box>

          {/* Log Details Dialog */}
          <StyledDialog open={!!selectedLog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
            <DialogTitle sx={{ bgcolor: '#90CAF920', color: primaryColor, fontWeight: 'medium' }}>
              Event Log Details
            </DialogTitle>
            <DialogContent dividers sx={{ bgcolor: secondaryColor }}>
              {selectedLog && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 2 }}>
                  <Typography sx={{ color: primaryColor, fontWeight: 'medium' }}>
                    <strong>Event ID:</strong> {selectedLog.EventID}
                  </Typography>
                  <Typography sx={{ color: primaryColor, fontWeight: 'medium' }}>
                    <strong>Type:</strong> {selectedLog.EventType || 'N/A'}
                  </Typography>
                  <Typography sx={{ color: primaryColor, fontWeight: 'medium' }}>
                    <strong>Source:</strong> {selectedLog.Source || 'N/A'}
                  </Typography>
                  <Typography sx={{ color: primaryColor, fontWeight: 'medium', whiteSpace: 'pre-wrap' }}>
                    <strong>Description:</strong> {selectedLog.Description || 'N/A'}
                  </Typography>
                  <Typography sx={{ color: primaryColor, fontWeight: 'medium' }}>
                    <strong>Timestamp:</strong>{' '}
                    {selectedLog.Timestamp ? new Date(selectedLog.Timestamp).toLocaleString() : 'N/A'}
                  </Typography>
                  <Typography sx={{ color: primaryColor, fontWeight: 'medium' }}>
                    <strong>Sent to Server:</strong>{' '}
                    <Chip
                      label={selectedLog.IsSentToServer ? 'Yes' : 'No'}
                      sx={{
                        bgcolor: selectedLog.IsSentToServer ? primaryColor : '#999999',
                        color: '#FFFFFF',
                      }}
                      size="small"
                    />
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions sx={{ bgcolor: '#90CAF920' }}>
              <Button
                startIcon={<ContentCopyIcon />}
                onClick={() =>
                  copyToClipboard(
                    JSON.stringify(
                      selectedLog
                        ? {
                            EventID: selectedLog.EventID,
                            EventType: selectedLog.EventType,
                            Source: selectedLog.Source,
                            Description: selectedLog.Description,
                            Timestamp: selectedLog.Timestamp,
                            IsSentToServer: selectedLog.IsSentToServer,
                          }
                        : {},
                      null,
                      2
                    )
                  )
                }
                sx={{ color: primaryColor, textTransform: 'none' }}
                aria-label="Copy log details to clipboard"
              >
                Copy
              </Button>
              <Button
                onClick={handleCloseDialog}
                variant="contained"
                sx={{
                  bgcolor: primaryColor,
                  color: '#FFFFFF',
                  '&:hover': { bgcolor: '#64B5F6' },
                  textTransform: 'none',
                }}
                aria-label="Close dialog"
              >
                Close
              </Button>
            </DialogActions>
          </StyledDialog>

          {/* Snackbar for Notifications */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            message={snackbar.message}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          />
        </Card>
      </Box>
    </Template>
  );
}