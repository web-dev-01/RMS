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
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Stack,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrainIcon from '@mui/icons-material/Train';
import TeaIcon from '@mui/icons-material/LocalCafe';
import LunchDiningIcon from '@mui/icons-material/LunchDining';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { useRouter } from 'next/navigation';
import Template from '@/app/dashboard/Template';

interface Train {
  _id: string;
  TrainNumber: string;
  TrainNameEnglish: string;
  TrainNameHindi: string;
  Ref: 'NTES' | 'User';
  SrcCode: string;
  SrcNameEnglish: string;
  SrcNameHindi: string;
  DestCode: string;
  DestNameEnglish: string;
  DestNameHindi: string;
  STA: string;
  STD: string;
  LateBy: string;
  ETA: string;
  ETD: string;
  PFNo: string;
  Status: 'Running Late' | 'On Time' | 'Arriving Soon' | 'Arrived' | 'Departed';
  TypeAorD: 'A' | 'D';
  CoachList: string[];
  createdAt: string;
}

const ActiveTrainsPage: React.FC = () => {
  const [trains, setTrains] = useState<Train[]>([]);
  const [filteredTrains, setFilteredTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [showCoachList, setShowCoachList] = useState<boolean>(false);
  const [stationCode, setStationCode] = useState<string>('');
  const router = useRouter();

  const colors = {
    primary: '#00BFA6',
    secondary: '#FF6F61',
    darkBg: '#121212',
    cardBg: '#1E1E1E',
    chipOnTime: '#00BFA6',
    chipLate: '#FFB347',
    chipVeryLate: '#FF4C4C',
    textPrimary: '#E0E0E0',
    textSecondary: '#B0B0B0',
    hoverShadow: '0 8px 20px rgba(0,191,166,0.3)',
  };

  const fetchStationCode = async (): Promise<void> => {
    try {
      const res = await fetch('/api/rms/station-code', {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      });
      const json = await res.json();
      if (json.success && json.data?.stationCode) {
        setStationCode(json.data.stationCode);
      } else {
        console.warn(json.message || 'No station code found');
        setStationCode('NDLS');
      }
    } catch (error) {
      console.error('Error fetching station code:', error);
      setStationCode('NDLS');
    }
  };

  const fetchTrains = async (): Promise<void> => {
    setLoading(true);
    try {
      const res = await fetch(`/api/rms/active-trains?stationCode=${stationCode}`, {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      });
      const json = await res.json();

      if (json.success && Array.isArray(json.data)) {
        setTrains(json.data);
        setFilteredTrains(json.data);
      } else {
        setTrains([]);
        setFilteredTrains([]);
        console.warn(json.message || 'No active trains found');
      }
    } catch (error) {
      console.error('Error fetching active trains:', error);
      setTrains([]);
      setFilteredTrains([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStationCode();
  }, []);

  useEffect(() => {
    if (stationCode) {
      fetchTrains();
    }
  }, [stationCode]);

  useEffect(() => {
    let filtered = trains;

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (train) =>
          train.TrainNumber.toLowerCase().includes(lowerQuery) ||
          train.TrainNameEnglish.toLowerCase().includes(lowerQuery) ||
          train.SrcNameEnglish.toLowerCase().includes(lowerQuery) ||
          train.DestNameEnglish.toLowerCase().includes(lowerQuery)
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter((train) => train.Status === statusFilter);
    }

    if (typeFilter !== 'All') {
      filtered = filtered.filter((train) => train.TypeAorD === typeFilter);
    }

    setFilteredTrains(filtered);
  }, [searchQuery, statusFilter, typeFilter, trains]);

  const handleView = (train: Train): void => {
    setSelectedTrain(train);
    setShowCoachList(false);
  };

  const handleCloseDialog = (): void => {
    setSelectedTrain(null);
    setShowCoachList(false);
  };

  const toggleCoachList = (): void => {
    setShowCoachList((prev) => !prev);
  };

  const getStatusColor = (status: string): string => {
    const s = status.toLowerCase();
    if (s.includes('on time')) return colors.chipOnTime;
    if (s.includes('late')) return colors.chipLate;
    return colors.chipVeryLate;
  };

  return (
    <Template>
      <Box
        sx={{
          py: 5,
          minHeight: '100vh',
          bgcolor: colors.darkBg,
          color: colors.textPrimary,
          fontFamily: "'Roboto', sans-serif",
          userSelect: 'none',
          px: { xs: 2, sm: 4 },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 5,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: colors.primary,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <TrainIcon fontSize="large" />
            Active Trains Dashboard 
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton
              onClick={fetchTrains}
              sx={{
                color: colors.primary,
                transition: 'all 0.3s ease',
                '&:hover': { bgcolor: `${colors.primary}33`, transform: 'scale(1.15)' },
              }}
              aria-label="refresh trains"
              disabled={loading}
            >
              <RefreshIcon />
            </IconButton>
            <Button
              variant="outlined"
              sx={{ color: colors.primary, borderColor: colors.primary }}
              onClick={() => router.push('/dashboard')}
            >
              Back to Dashboard
            </Button>
          </Box>
        </Box>

        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' }, 
            gap: 2, 
            mb: 4 
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <TextField
              fullWidth
              label="Search by Train Number/Name/Route"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: colors.textSecondary, mr: 1 }} />,
              }}
              sx={{
                bgcolor: colors.cardBg,
                '& .MuiOutlinedInput-root': {
                  color: colors.textPrimary,
                  '& fieldset': { borderColor: colors.primary },
                  '&:hover fieldset': { borderColor: colors.secondary },
                },
                '& .MuiInputLabel-root': { color: colors.textSecondary },
              }}
            />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: colors.textSecondary }}>Filter by Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Filter by Status"
                sx={{
                  bgcolor: colors.cardBg,
                  color: colors.textPrimary,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.secondary },
                }}
                startAdornment={<FilterListIcon sx={{ color: colors.textSecondary, mr: 1 }} />}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="On Time">On Time</MenuItem>
                <MenuItem value="Running Late">Running Late</MenuItem>
                <MenuItem value="Arriving Soon">Arriving Soon</MenuItem>
                <MenuItem value="Arrived">Arrived</MenuItem>
                <MenuItem value="Departed">Departed</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: colors.textSecondary }}>Filter by Type (A/D)</InputLabel>
              <Select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                label="Filter by Type (A/D)"
                sx={{
                  bgcolor: colors.cardBg,
                  color: colors.textPrimary,
                  '& .MuiOutlinedInput-notchedOutline': { borderColor: colors.primary },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: colors.secondary },
                }}
                startAdornment={<FilterListIcon sx={{ color: colors.textSecondary, mr: 1 }} />}
              >
                <MenuItem value="All">All</MenuItem>
                <MenuItem value="A">Arrival (A)</MenuItem>
                <MenuItem value="D">Departure (D)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress size={70} sx={{ color: colors.primary }} />
          </Box>
        )}

        {!loading && filteredTrains.length === 0 && (
          <Typography variant="h5" sx={{ textAlign: 'center', mt: 6, color: colors.textSecondary }}>
            No active trains match your criteria.
          </Typography>
        )}

        {!loading && filteredTrains.length > 0 && (
          <TableContainer
            component={Paper}
            sx={{
              bgcolor: colors.cardBg,
              borderRadius: 0,
              border: `1px solid ${colors.primary}`,
              overflowY: 'auto',
              maxHeight: '60vh',
              '&::-webkit-scrollbar': { width: '6px' },
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#555', borderRadius: '3px' },
            }}
          >
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: colors.primary, fontWeight: 'bold', bgcolor: colors.darkBg }}>
                    Train Number
                  </TableCell>
                  <TableCell sx={{ color: colors.primary, fontWeight: 'bold', bgcolor: colors.darkBg }}>
                    Train Name
                  </TableCell>
                  <TableCell sx={{ color: colors.primary, fontWeight: 'bold', bgcolor: colors.darkBg }}>From</TableCell>
                  <TableCell sx={{ color: colors.primary, fontWeight: 'bold', bgcolor: colors.darkBg }}>To</TableCell>
                  <TableCell sx={{ color: colors.primary, fontWeight: 'bold', bgcolor: colors.darkBg }} align="center">
                    Scheduled Times
                  </TableCell>
                  <TableCell sx={{ color: colors.primary, fontWeight: 'bold', bgcolor: colors.darkBg }} align="center">
                    Estimated Times
                  </TableCell>
                  <TableCell sx={{ color: colors.primary, fontWeight: 'bold', bgcolor: colors.darkBg }}>Status</TableCell>
                  <TableCell sx={{ color: colors.primary, fontWeight: 'bold', bgcolor: colors.darkBg }}>
                    Platform No
                  </TableCell>
                  <TableCell sx={{ color: colors.primary, fontWeight: 'bold', bgcolor: colors.darkBg }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTrains.map((train) => (
                  <TableRow
                    key={train._id}
                    sx={{
                      '&:hover': { bgcolor: `${colors.cardBg}DD`, cursor: 'pointer' },
                    }}
                    onClick={() => handleView(train)}
                  >
                    <TableCell sx={{ color: colors.textPrimary }}>{train.TrainNumber}</TableCell>
                    <TableCell sx={{ color: colors.textPrimary }}>{train.TrainNameEnglish}</TableCell>
                    <TableCell sx={{ color: colors.textPrimary }}>
                      {train.SrcCode} - {train.SrcNameEnglish}
                    </TableCell>
                    <TableCell sx={{ color: colors.textPrimary }}>
                      {train.DestCode} - {train.DestNameEnglish}
                    </TableCell>

                    <TableCell sx={{ color: colors.textPrimary }} align="center">
                      <Typography sx={{ fontWeight: 'bold' }}>Arrival: {train.STA}</Typography>
                      <Typography sx={{ fontWeight: 'bold' }}>Departure: {train.STD}</Typography>
                    </TableCell>

                    <TableCell sx={{ color: colors.textPrimary }} align="center">
                      <Typography sx={{ fontWeight: 'bold' }}>Arrival: {train.ETA}</Typography>
                      <Typography sx={{ fontWeight: 'bold' }}>Departure: {train.ETD}</Typography>
                    </TableCell>

                    <TableCell sx={{ color: colors.textPrimary }}>
                      <Chip
                        label={train.Status}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(train.Status),
                          color: colors.darkBg,
                          fontWeight: 'bold',
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: colors.textPrimary }}>{train.PFNo || 'N/A'}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details" arrow>
                        <IconButton
                          size="small"
                          sx={{ color: colors.primary }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(train);
                          }}
                        >
                          <TrainIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Dialog
          open={!!selectedTrain}
          onClose={handleCloseDialog}
          fullWidth
          maxWidth="md"
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: 4,
              bgcolor: colors.cardBg,
              color: colors.textPrimary,
              px: 3,
              pb: 2,
            },
          }}
        >
          <DialogTitle
            sx={{
              bgcolor: `${colors.primary}22`,
              color: colors.primary,
              fontWeight: 700,
              fontSize: '1.75rem',
            }}
          >
            Train Details
          </DialogTitle>
          <DialogContent dividers>
            {selectedTrain && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 3,
                  fontFamily: "'Roboto Mono', monospace",
                }}
              >
                <Typography variant="h6" sx={{ color: colors.secondary }}>
                  {selectedTrain.TrainNameEnglish} ({selectedTrain.TrainNameHindi})
                </Typography>

                <Divider sx={{ bgcolor: colors.primary }} />

                <List dense disablePadding>
                  <ListItem>
                    <ListItemIcon>
                      <TrainIcon sx={{ color: colors.primary }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Train Number"
                      secondary={selectedTrain.TrainNumber}
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                      secondaryTypographyProps={{ color: colors.textSecondary }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LunchDiningIcon sx={{ color: colors.secondary }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Route (English)"
                      secondary={`${selectedTrain.SrcNameEnglish} (${selectedTrain.SrcCode}) ➡️ ${selectedTrain.DestNameEnglish} (${selectedTrain.DestCode})`}
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                      secondaryTypographyProps={{ color: colors.textSecondary }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <TeaIcon sx={{ color: colors.secondary }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Route (Hindi)"
                      secondary={`${selectedTrain.SrcNameHindi} ➡️ ${selectedTrain.DestNameHindi}`}
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                      secondaryTypographyProps={{ color: colors.textSecondary }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <RefreshIcon sx={{ color: colors.primary }} />
                    </ListItemIcon>
                    <ListItemText
                      primary="Reference"
                      secondary={selectedTrain.Ref}
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                      secondaryTypographyProps={{ color: colors.textSecondary }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Scheduled Time"
                      secondary={
                        selectedTrain.TypeAorD === 'A'
                          ? `Arrival at ${selectedTrain.STA}`
                          : `Departure at ${selectedTrain.STD}`
                      }
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                      secondaryTypographyProps={{ color: colors.textSecondary }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Estimated Time"
                      secondary={
                        selectedTrain.TypeAorD === 'A'
                          ? `Arrival at ${selectedTrain.ETA}`
                          : `Departure at ${selectedTrain.ETD}`
                      }
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                      secondaryTypographyProps={{ color: colors.textSecondary }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Late By"
                      secondary={selectedTrain.LateBy}
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                      secondaryTypographyProps={{ color: colors.textSecondary }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Platform Number"
                      secondary={selectedTrain.PFNo || 'N/A'}
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                      secondaryTypographyProps={{ color: colors.textSecondary }}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Status"
                      secondary={
                        <Chip
                          label={selectedTrain.Status}
                          size="small"
                          sx={{
                            bgcolor: getStatusColor(selectedTrain.Status),
                            color: colors.darkBg,
                            fontWeight: 'bold',
                          }}
                        />
                      }
                      primaryTypographyProps={{ fontWeight: 'bold' }}
                    />
                  </ListItem>
                </List>

                <Box>
                  <Button
                    variant="outlined"
                    onClick={toggleCoachList}
                    sx={{
                      borderColor: colors.primary,
                      color: colors.primary,
                      fontWeight: 600,
                      textTransform: 'none',
                      mb: 1,
                      '&:hover': { bgcolor: colors.primary + '11', borderColor: colors.primary },
                    }}
                    startIcon={<TrainIcon />}
                  >
                    {showCoachList ? 'Hide Coaches' : `Show Coaches (${selectedTrain.CoachList.length})`}
                  </Button>

                  <Collapse in={showCoachList} timeout="auto" unmountOnExit>
                    {selectedTrain.CoachList.length === 0 ? (
                      <Typography sx={{ color: colors.textSecondary, fontStyle: 'italic' }}>
                        No coach information available.
                      </Typography>
                    ) : (
                      <Stack
                        direction="row"
                        flexWrap="wrap"
                        gap={1}
                        sx={{ mt: 1, maxHeight: 150, overflowY: 'auto' }}
                      >
                        {selectedTrain.CoachList.map((coach, idx) => (
                          <Chip
                            key={idx}
                            label={coach}
                            size="small"
                            sx={{ bgcolor: colors.primary, color: colors.darkBg, fontWeight: 'bold' }}
                          />
                        ))}
                      </Stack>
                    )}
                  </Collapse>
                </Box>

                <Typography
                  variant="caption"
                  sx={{ color: colors.textSecondary, fontStyle: 'italic', mt: 2, textAlign: 'right' }}
                >
                  Created At: {new Date(selectedTrain.createdAt).toLocaleString()}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleCloseDialog}
              variant="contained"
              sx={{ bgcolor: colors.secondary, color: '#fff', '&:hover': { bgcolor: '#f25f50' } }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Template>
  );
};

export default ActiveTrainsPage;