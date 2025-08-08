'use client';

import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useEffect, useState } from 'react';
import axios from 'axios';

// Define interface for device data
interface Device {
  Id: number;
  Created: string;
  Updated: string;
  DeviceType: string;
  Description: string;
  IpAddress: string;
  Status: boolean;
  LastStatusWhen: string;
  IsEnabled: boolean;
}

// Define interface for platform data
interface Platform {
  PlatformNumber: string;
  PlatformType: string;
  Description: string;
  Subnet: string;
  Devices: Device[] | undefined;
}

// Define interface for station data
interface Station {
  _id: string;
  stationCode: string;
  stationName: string;
  platforms: Platform[];
  createdAt: string;
  updatedAt: string;
}

export default function PlatformsDevicesPage() {
  // State for stations, loading, error, and dialogs
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(null);

  // Define color scheme for vibrant UI
  const primaryColor = '#00ED64'; // MongoDB green
  const secondaryColor = '#0A0F19'; // Dark navy
  const accentColor = '#00CC55'; // Brighter green for hover

  // Fetch station and device data from API
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get('/api/rms/platforms-devices');
      // Ensure stations is an array
      setStations(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err: any) {
      console.error('GET error:', err);
      setError('Server error while loading data.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  // Handle click on a device to show its details
  const handleDeviceClick = (device: Device) => {
    setSelectedDevice(device);
  };

  // Handle click on a platform to show all its devices
  const handlePlatformClick = (platform: Platform) => {
    setSelectedPlatform(platform);
  };

  // Close the device details dialog
  const handleCloseDeviceDialog = () => {
    setSelectedDevice(null);
  };

  // Close the platform devices dialog
  const handleClosePlatformDialog = () => {
    setSelectedPlatform(null);
  };

  return (
    <Box sx={{ p: 4, bgcolor: secondaryColor, minHeight: '100vh' }}>
      {/* Header with title and refresh button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: primaryColor }}>
          Station Platforms & Devices
        </Typography>
        <Tooltip title="Refresh Data">
          <IconButton
            onClick={fetchData}
            sx={{ color: primaryColor, '&:hover': { bgcolor: '#00ED6433' } }}
          >
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Main content */}
      {loading ? (
        // Show loading spinner
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
          <CircularProgress size={60} sx={{ color: primaryColor }} />
        </Box>
      ) : error ? (
        // Show error message
        <Alert
          severity="error"
          sx={{ borderRadius: 2, boxShadow: 1, bgcolor: secondaryColor, color: primaryColor }}
        >
          {error}
        </Alert>
      ) : stations.length === 0 ? (
        // Show no stations message
        <Alert
          severity="info"
          sx={{ borderRadius: 2, boxShadow: 1, bgcolor: secondaryColor, color: primaryColor }}
        >
          No stations found.
        </Alert>
      ) : (
        // Display stations and platforms
        <Grid container spacing={3}>
          {stations.map((station) => (
            <Grid item xs={12} key={station._id}>
              <Paper
                elevation={4}
                sx={{
                  p: 3,
                  bgcolor: '#0A0F19EE',
                  borderRadius: 2,
                  border: `1px solid ${primaryColor}`,
                  '&:hover': { boxShadow: `0 6px 24px ${primaryColor}44` },
                  transition: 'box-shadow 0.3s',
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ color: primaryColor, fontWeight: 'bold', mb: 2 }}
                >
                  {station.stationName || 'N/A'} ({station.stationCode || 'N/A'})
                </Typography>
                <Divider sx={{ my: 2, bgcolor: primaryColor }} />
                <Grid container spacing={2}>
                  {(station.platforms || []).map((platform, idx) => (
                    <Grid item xs={12} sm={6} lg={4} key={idx}>
                      <Card
                        variant="outlined"
                        onClick={() => handlePlatformClick(platform)}
                        sx={{
                          borderColor: primaryColor,
                          borderRadius: 2,
                          '&:hover': {
                            boxShadow: `0 4px 16px ${primaryColor}66`,
                            bgcolor: '#00ED6410',
                            cursor: 'pointer',
                          },
                          transition: 'all 0.3s',
                          bgcolor: secondaryColor,
                        }}
                      >
                        <CardContent sx={{ p: 3 }}>
                          <Typography
                            variant="h6"
                            sx={{ fontWeight: 'bold', color: primaryColor }}
                          >
                            Platform #{platform.PlatformNumber || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: primaryColor, mt: 1 }}>
                            Type: {platform.PlatformType || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: primaryColor }}>
                            Subnet: {platform.Subnet || 'N/A'}
                          </Typography>
                          <Divider sx={{ my: 2, bgcolor: primaryColor }} />
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 'medium', color: primaryColor, mb: 1.5 }}
                          >
                            Devices:
                          </Typography>
                          {(!platform.Devices || platform.Devices.length === 0) ? (
                            <Typography
                              variant="caption"
                              sx={{ color: primaryColor, fontStyle: 'italic' }}
                            >
                              No devices found.
                            </Typography>
                          ) : (
                            platform.Devices.map((device, index) => (
                              <Box
                                key={index}
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  p: 1,
                                  borderRadius: 1,
                                  '&:hover': { bgcolor: '#00ED6433' },
                                  transition: 'background-color 0.2s',
                                }}
                              >
                                <Box>
                                  <Typography variant="body2" sx={{ color: primaryColor }}>
                                    {device.Description || 'N/A'}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: primaryColor }}>
                                    {device.DeviceType || 'N/A'}
                                  </Typography>
                                </Box>
                                <Tooltip title="View Device Details">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevent platform dialog
                                      handleDeviceClick(device);
                                    }}
                                    sx={{ color: primaryColor, '&:hover': { color: accentColor } }}
                                  >
                                    <InfoIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            ))
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog for single device details */}
      <Dialog
        open={!!selectedDevice}
        onClose={handleCloseDeviceDialog}
        fullWidth
        maxWidth="sm"
        sx={{ '& .MuiDialog-paper': { borderRadius: 2, bgcolor: secondaryColor } }}
      >
        <DialogTitle sx={{ bgcolor: '#acbdb31f', color: primaryColor, fontWeight: 'medium' }}>
          Device Information
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: secondaryColor }}>
          {selectedDevice && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography sx={{ color: primaryColor }}>
                <strong>ID:</strong> {selectedDevice.Id || 'N/A'}
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>Type:</strong> {selectedDevice.DeviceType || 'N/A'}
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>Description:</strong> {selectedDevice.Description || 'N/A'}
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>IP Address:</strong> {selectedDevice.IpAddress || 'N/A'}
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>Status:</strong>{' '}
                <Chip
                  label={selectedDevice.Status ? 'Active' : 'Inactive'}
                  sx={{
                    bgcolor: selectedDevice.Status ? primaryColor : '#FF3333',
                    color: secondaryColor,
                  }}
                  size="small"
                />
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>Created:</strong>{' '}
                {selectedDevice.Created
                  ? new Date(selectedDevice.Created).toLocaleString()
                  : 'N/A'}
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>Updated:</strong>{' '}
                {selectedDevice.Updated
                  ? new Date(selectedDevice.Updated).toLocaleString()
                  : 'N/A'}
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>Last Status:</strong>{' '}
                {selectedDevice.LastStatusWhen
                  ? new Date(selectedDevice.LastStatusWhen).toLocaleString()
                  : 'N/A'}
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>Is Enabled:</strong>{' '}
                <Chip
                  label={selectedDevice.IsEnabled ? 'Yes' : 'No'}
                  sx={{
                    bgcolor: selectedDevice.IsEnabled ? primaryColor : '#999999',
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
            onClick={handleCloseDeviceDialog}
            variant="contained"
            sx={{ bgcolor: primaryColor, color: secondaryColor, '&:hover': { bgcolor: accentColor } }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog for platform devices */}
      <Dialog
        open={!!selectedPlatform}
        onClose={handleClosePlatformDialog}
        fullWidth
        maxWidth="md"
        sx={{ '& .MuiDialog-paper': { borderRadius: 2, bgcolor: secondaryColor } }}
      >
        <DialogTitle sx={{ bgcolor: '#00ED6420', color: primaryColor, fontWeight: 'medium' }}>
          Devices for Platform #{selectedPlatform?.PlatformNumber || 'N/A'}
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: secondaryColor }}>
          {selectedPlatform && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6" sx={{ color: primaryColor, mb: 1 }}>
                Platform Details
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>Type:</strong> {selectedPlatform.PlatformType || 'N/A'}
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>Description:</strong> {selectedPlatform.Description || 'N/A'}
              </Typography>
              <Typography sx={{ color: primaryColor }}>
                <strong>Subnet:</strong> {selectedPlatform.Subnet || 'N/A'}
              </Typography>
              <Divider sx={{ my: 2, bgcolor: primaryColor }} />
              <Typography variant="h6" sx={{ color: primaryColor, mb: 1 }}>
                Devices
              </Typography>
              {(!selectedPlatform.Devices || selectedPlatform.Devices.length === 0) ? (
                <Typography sx={{ color: primaryColor, fontStyle: 'italic' }}>
                  No devices found.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {selectedPlatform.Devices.map((device, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card
                        variant="outlined"
                        sx={{
                          borderColor: primaryColor,
                          bgcolor: '#0A0F1922',
                          '&:hover': { boxShadow: `0 2px 8px ${primaryColor}66` },
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Typography variant="body2" sx={{ color: primaryColor }}>
                            <strong>ID:</strong> {device.Id || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: primaryColor }}>
                            <strong>Type:</strong> {device.DeviceType || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: primaryColor }}>
                            <strong>Description:</strong> {device.Description || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: primaryColor }}>
                            <strong>Status:</strong>{' '}
                            <Chip
                              label={device.Status ? 'Active' : 'Inactive'}
                              size="small"
                              sx={{
                                bgcolor: device.Status ? primaryColor : '#FF3333',
                                color: secondaryColor,
                              }}
                            />
                          </Typography>
                          <Typography variant="body2" sx={{ color: primaryColor }}>
                            <strong>IP Address:</strong> {device.IpAddress || 'N/A'}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#0A0F19CC' }}>
          <Button
            onClick={handleClosePlatformDialog}
            variant="contained"
            sx={{ bgcolor: primaryColor, color: secondaryColor, '&:hover': { bgcolor: accentColor } }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}