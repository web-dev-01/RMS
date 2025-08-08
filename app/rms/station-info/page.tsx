'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Paper,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from 'axios';

type Station = {
  _id: string;
  StationCode: string;
  RegionalLanguage: string;
  StationNameEnglish: string;
  StationNameHindi: string;
  StationNameRegional: string;
  Latitude?: number;
  Longitude?: number;
  Altitude?: number;
  NumberOfPlatforms?: number;
  NumberOfSplPlatforms?: number;
  NumberOfStationEntrances?: number;
  NumberOfPlatformBridges?: number;
  createdAt?: string;
};

export default function StationListPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState('');
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchStations();
  }, []);

  useEffect(() => {
    if (!Array.isArray(stations)) return;

    const filtered = stations.filter(
      (station) =>
        station.StationNameEnglish?.toLowerCase().includes(search.toLowerCase()) ||
        station.StationCode?.toLowerCase().includes(search.toLowerCase()) ||
        station.RegionalLanguage?.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredStations(filtered);
  }, [search, stations]);

  const fetchStations = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/rms/station-info');

      // ✅ Fix: read from res.data.data, not res.data.stations
      const data = res.data?.data;
      if (Array.isArray(data)) {
        setStations(data);
      } else {
        console.error('Unexpected station data format:', res.data);
        setStations([]);
      }
    } catch (error) {
      console.error('Failed to fetch stations:', error);
      setStations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (station: Station) => {
    setSelectedStation(station);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setSelectedStation(null);
    setOpenDialog(false);
  };

  const columns: GridColDef[] = [
    { field: 'StationCode', headerName: 'Code', width: 120 },
    { field: 'StationNameEnglish', headerName: 'English Name', width: 180 },
    { field: 'StationNameHindi', headerName: 'Hindi Name', width: 160 },
    { field: 'StationNameRegional', headerName: 'Regional Name', width: 160 },
    { field: 'RegionalLanguage', headerName: 'Language', width: 130 },
    {
      field: 'Latitude',
      headerName: 'Lat',
      width: 100,
      renderCell: (params) => <Chip label={params.value ?? '-'} size="small" />,
    },
    {
      field: 'Longitude',
      headerName: 'Long',
      width: 100,
      renderCell: (params) => <Chip label={params.value ?? '-'} size="small" />,
    },
    {
      field: 'Altitude',
      headerName: 'Alt',
      width: 90,
      renderCell: (params) => <Chip label={params.value ?? '-'} size="small" />,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: ({ row }) => (
        <Box display="flex" gap={1}>
          <Tooltip title="View">
            <IconButton onClick={() => handleView(row)} color="primary">
              <VisibilityIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton color="warning" disabled>
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton color="error" disabled>
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Station List
      </Typography>

      <Paper sx={{ p: 2, mb: 2, display: 'flex', alignItems: 'center' }}>
        <SearchIcon sx={{ mr: 1 }} />
        <TextField
          variant="standard"
          fullWidth
          placeholder="Search by Station Name or Code or Language..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Tooltip title="Refresh">
          <IconButton onClick={fetchStations}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={filteredStations}
            columns={columns}
            getRowId={(row) => row._id}
            pageSize={10}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </Paper>
      )}

      <Dialog open={openDialog} onClose={handleDialogClose} fullWidth>
        <DialogTitle>Station Details</DialogTitle>
        <DialogContent dividers>
          {selectedStation && (
            <Box display="flex" flexDirection="column" gap={1}>
              <Typography><b>Station Code:</b> {selectedStation.StationCode}</Typography>
              <Typography><b>English Name:</b> {selectedStation.StationNameEnglish}</Typography>
              <Typography><b>Hindi Name:</b> {selectedStation.StationNameHindi}</Typography>
              <Typography><b>Regional Name:</b> {selectedStation.StationNameRegional}</Typography>
              <Typography><b>Regional Language:</b> {selectedStation.RegionalLanguage}</Typography>
              <Typography><b>Latitude:</b> {selectedStation.Latitude ?? 'N/A'}</Typography>
              <Typography><b>Longitude:</b> {selectedStation.Longitude ?? 'N/A'}</Typography>
              <Typography><b>Altitude:</b> {selectedStation.Altitude ?? 'N/A'}</Typography>
              <Typography><b>Number of Platforms:</b> {selectedStation.NumberOfPlatforms ?? 'N/A'}</Typography>
              <Typography><b>Special Platforms:</b> {selectedStation.NumberOfSplPlatforms ?? 'N/A'}</Typography>
              <Typography><b>Station Entrances:</b> {selectedStation.NumberOfStationEntrances ?? 'N/A'}</Typography>
              <Typography><b>Platform Bridges:</b> {selectedStation.NumberOfPlatformBridges ?? 'N/A'}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
