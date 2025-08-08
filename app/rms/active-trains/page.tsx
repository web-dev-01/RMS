'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Container,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import TrainIcon from '@mui/icons-material/Train';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';

// Define interface for train data
interface Train {
  _id: string;
  TrainNumber: string;
  TrainNameEnglish: string;
  TrainNameHindi: string;
  Ref: string;
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
  Status: string;
  TypeAorD: string;
  CoachList: string[];
  createdAt: string;
}

export default function TrainPage() {
  const [trains, setTrains] = useState<Train[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const primaryColor = '#00ED64'; // MongoDB green
  const secondaryColor = '#0A0F19'; // Dark navy

  const fetchTrains = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/rms/active-trains');
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      const data = await response.json();
      setTrains(Array.isArray(data.data) ? data.data : []);
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'Error fetching trains');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrains();
  }, []);

  const handleView = (train: Train) => {
    setSelectedTrain(train);
  };

  const handleCloseDialog = () => {
    setSelectedTrain(null);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4, bgcolor: secondaryColor, minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography
          variant="h4"
          sx={{ fontWeight: 'bold', color: primaryColor, display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <TrainIcon fontSize="large" />
          Active Trains Dashboard
        </Typography>
        <Tooltip title="Refresh Trains">
          <IconButton
            onClick={fetchTrains}
            sx={{ color: primaryColor, '&:hover': { bgcolor: '#00ED6420' } }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
          <CircularProgress size={60} sx={{ color: primaryColor }} />
        </Box>
      ) : error ? (
        <Typography sx={{ color: primaryColor, textAlign: 'center', fontSize: '1.5rem' }}>
          {error}
        </Typography>
      ) : trains.length === 0 ? (
        <Typography sx={{ color: primaryColor, textAlign: 'center', fontSize: '1.5rem' }}>
          No trains available.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {trains.map((train) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={train._id}>
              <Card
                elevation={3}
                sx={{
                  borderRadius: 4,
                  transition: '0.3s',
                  '&:hover': { boxShadow: `0 4px 20px ${primaryColor}33`, cursor: 'pointer' },
                  bgcolor: '#0A0F19CC',
                  border: `1px solid ${primaryColor}`,
                }}
                onClick={() => handleView(train)}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', color: primaryColor, mb: 1 }}>
                    {train.TrainNameEnglish} ({train.TrainNumber})
                  </Typography>
                  <Typography variant="body2" sx={{ color: primaryColor, mb: 0.5 }}>
                    <strong>Route:</strong> {train.SrcNameEnglish} ({train.SrcCode}) ➡️ {train.DestNameEnglish} ({train.DestCode})
                  </Typography>
                  <Typography variant="body2" sx={{ color: primaryColor, mb: 0.5 }}>
                    <strong>Scheduled:</strong> {train.TypeAorD === 'A' ? `Arrival ${train.STA}` : `Departure ${train.STD}`}
                  </Typography>
                  <Typography variant="body2" sx={{ color: primaryColor, mb: 0.5 }}>
                    <strong>Estimated:</strong> {train.TypeAorD === 'A' ? `Arrival ${train.ETA}` : `Departure ${train.ETD}`}
                  </Typography>
                  <Typography variant="body2" sx={{ color: primaryColor, mb: 0.5 }}>
                    <strong>Platform:</strong> {train.PFNo}
                  </Typography>
                  <Typography variant="body2" sx={{ color: primaryColor }}>
                    <strong>Status:</strong>{' '}
                    <Chip
                      label={train.Status}
                      size="small"
                      sx={{
                        bgcolor:
                          train.Status.toLowerCase().includes('on time')
                            ? primaryColor
                            : train.Status.toLowerCase().includes('late')
                            ? '#FFA500'
                            : '#FF3333',
                        color: secondaryColor,
                      }}
                    />
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={!!selectedTrain}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        sx={{ '& .MuiDialog-paper': { borderRadius: 2, bgcolor: secondaryColor } }}
      >
        <DialogTitle sx={{ bgcolor: '#00ED6420', color: primaryColor, fontWeight: 'medium' }}>
          Train Details
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: secondaryColor }}>
          {selectedTrain && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ color: primaryColor }}>
                <strong>Name:</strong> {selectedTrain.TrainNameEnglish} ({selectedTrain.TrainNameHindi})
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>Number:</strong> {selectedTrain.TrainNumber}
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>Route:</strong> {selectedTrain.SrcNameEnglish} ({selectedTrain.SrcCode}) ➡️ {selectedTrain.DestNameEnglish} ({selectedTrain.DestCode})
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>Hindi Route:</strong> {selectedTrain.SrcNameHindi} ➡️ {selectedTrain.DestNameHindi}
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>Reference:</strong> {selectedTrain.Ref}
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>Scheduled Time:</strong> {selectedTrain.TypeAorD === 'A' ? `Arrival ${selectedTrain.STA}` : `Departure ${selectedTrain.STD}`}
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>Estimated Time:</strong> {selectedTrain.TypeAorD === 'A' ? `Arrival ${selectedTrain.ETA}` : `Departure ${selectedTrain.ETD}`}
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>Late By:</strong> {selectedTrain.LateBy}
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>Platform:</strong> {selectedTrain.PFNo}
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>Status:</strong>{' '}
                <Chip
                  label={selectedTrain.Status}
                  size="small"
                  sx={{
                    bgcolor:
                      selectedTrain.Status.toLowerCase().includes('on time')
                        ? primaryColor
                        : selectedTrain.Status.toLowerCase().includes('late')
                        ? '#FFA500'
                        : '#FF3333',
                    color: secondaryColor,
                  }}
                />
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>Coaches:</strong> {selectedTrain.CoachList.join(', ')}
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>Created At:</strong> {new Date(selectedTrain.createdAt).toLocaleString()}
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
    </Container>
  );
}