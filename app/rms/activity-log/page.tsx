'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Pagination,
  Stack,
  Divider,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import ClearIcon from '@mui/icons-material/Clear';

interface LogEntry {
  id: number;
  timestamp: string;
  user: string;
  action: string;
  status: string;
}

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [userFilter, setUserFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const uniqueUsers = useMemo(() => {
    const users = logs.map(log => log.user);
    return ['All', ...Array.from(new Set(users))];
  }, [logs]);

  const handleSearch = (value: string) => {
    setSearchTerm(value.toLowerCase());
    setCurrentPage(1);
  };

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleUserFilter = (value: string) => {
    setUserFilter(value);
    setCurrentPage(1);
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/activity-log');
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error('Error loading logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    let filtered = [...logs];

    if (searchTerm) {
      filtered = filtered.filter(
        log =>
          log.user.toLowerCase().includes(searchTerm) ||
          log.action.toLowerCase().includes(searchTerm) ||
          log.status.toLowerCase().includes(searchTerm)
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(log => log.status === statusFilter);
    }

    if (userFilter !== 'All') {
      filtered = filtered.filter(log => log.user === userFilter);
    }

    setFilteredLogs(filtered);
  }, [logs, searchTerm, statusFilter, userFilter]);

  const columns: GridColDef[] = [
    { field: 'timestamp', headerName: 'Timestamp', flex: 1, minWidth: 150 },
    { field: 'user', headerName: 'User', flex: 1 },
    { field: 'action', headerName: 'Action', flex: 2 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 1,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'Success'
              ? 'success'
              : params.value === 'Failed'
              ? 'error'
              : 'default'
          }
          size="small"
        />
      ),
    },
  ];

  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredLogs.slice(start, start + rowsPerPage);
  }, [filteredLogs, currentPage]);

  return (
    <Container maxWidth="lg" sx={{ mt: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Activity Logs
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          View system-wide actions and events across the portal. Use filters or search to narrow down logs.
        </Typography>

        <Box
          sx={{
            display: 'flex',
            gap: 2,
            mt: 3,
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            fullWidth
            sx={{ maxWidth: 300 }}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => handleSearch('')}>
                    {searchTerm ? <ClearIcon /> : <SearchIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            label="Status"
            size="small"
            value={statusFilter}
            onChange={(e) => handleStatusFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            {['All', 'Success', 'Failed', 'Pending'].map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="User"
            size="small"
            value={userFilter}
            onChange={(e) => handleUserFilter(e.target.value)}
            sx={{ minWidth: 150 }}
          >
            {uniqueUsers.map((user) => (
              <MenuItem key={user} value={user}>
                {user}
              </MenuItem>
            ))}
          </TextField>

          <IconButton onClick={fetchLogs} size="small">
            <RefreshIcon />
          </IconButton>
        </Box>

        <Divider sx={{ my: 3 }} />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ height: 400, width: '100%' }}>
            <DataGrid
              rows={paginatedLogs}
              columns={columns}
              disableRowSelectionOnClick
              hideFooter
              rowHeight={42}
              autoHeight
            />
          </Box>
        )}

        <Stack spacing={2} alignItems="center" sx={{ mt: 3 }}>
          <Pagination
            count={Math.ceil(filteredLogs.length / rowsPerPage)}
            page={currentPage}
            onChange={(_, val) => setCurrentPage(val)}
            color="primary"
            size="small"
            showFirstButton
            showLastButton
          />
        </Stack>
      </Paper>
    </Container>
  );
}
