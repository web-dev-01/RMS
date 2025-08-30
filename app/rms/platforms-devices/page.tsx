'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Collapse,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  TableSortLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';

import {
  KeyboardArrowDown,
  KeyboardArrowUp,
  Info as InfoIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

import Template from '@/app/dashboard/Template';

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

interface Platform {
  PlatformNumber: string;
  PlatformType: string;
  Description: string;
  Subnet: string;
  Devices: Device[] | undefined;
}

interface LatestStationData {
  _id: string;
  stationCode: string;
  stationName: string;
  platforms: Platform[];
  createdAt: string;
  updatedAt: string;
}

// Sort helpers
type Order = 'asc' | 'desc';

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  const aValue = a[orderBy];
  const bValue = b[orderBy];
  
  // Handle null/undefined values
  if (bValue === undefined || bValue === null) return -1;
  if (aValue === undefined || aValue === null) return 1;
  
  if (bValue < aValue) return -1;
  if (bValue > aValue) return 1;
  return 0;
}

function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key,
): (a: { [key in Key]: any }, b: { [key in Key]: any }) => number {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort<T>(array: readonly T[], comparator: (a: T, b: T) => number) {
  const stabilized = array.map((el, index) => [el, index] as [T, number]);
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
}

// Device details dialog
function DeviceDetailsDialog({
  device,
  open,
  onClose,
}: {
  device: Device | null;
  open: boolean;
  onClose: () => void;
}) {
  const lightBlue = '#90CAF9';
  const darkGrey = '#121212';

  if (!device) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: lightBlue, color: darkGrey, fontWeight: 'bold' }}>
        Device Details - ID: {device.Id}
      </DialogTitle>
      <DialogContent dividers sx={{ bgcolor: darkGrey, color: lightBlue }}>
        <Typography><b>Type:</b> {device.DeviceType || 'N/A'}</Typography>
        <Typography><b>Description:</b> {device.Description || 'N/A'}</Typography>
        <Typography><b>IP Address:</b> {device.IpAddress || 'N/A'}</Typography>
        <Typography>
          <b>Status:</b>{' '}
          <Chip
            label={device.Status ? 'Active' : 'Inactive'}
            color={device.Status ? 'primary' : 'error'}
            size="small"
          />
        </Typography>
        <Typography><b>Enabled:</b> {device.IsEnabled ? 'Yes' : 'No'}</Typography>
        <Typography>
          <b>Created:</b> {new Date(device.Created).toLocaleString() || 'N/A'}
        </Typography>
        <Typography>
          <b>Updated:</b> {new Date(device.Updated).toLocaleString() || 'N/A'}
        </Typography>
        <Typography>
          <b>Last Status Time:</b>{' '}
          {device.LastStatusWhen ? new Date(device.LastStatusWhen).toLocaleString() : 'N/A'}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ bgcolor: darkGrey }}>
        <Button variant="contained" color="primary" onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function DeviceRow({ device, onDeviceClick }: { device: Device; onDeviceClick: (d: Device) => void }) {
  const lightBlue = '#90CAF9';
  const darkGrey = '#121212';

  return (
    <TableRow
      hover
      sx={{ bgcolor: '#1e1e1e', cursor: 'pointer' }}
      onClick={() => onDeviceClick(device)}
      tabIndex={-1}
    >
      <TableCell>{device.Id}</TableCell>
      <TableCell>{device.DeviceType || 'N/A'}</TableCell>
      <TableCell>{device.Description || 'N/A'}</TableCell>
      <TableCell>{device.IpAddress || 'N/A'}</TableCell>
      <TableCell>
        <Chip
          label={device.Status ? 'Active' : 'Inactive'}
          color={device.Status ? 'primary' : 'error'}
          size="small"
        />
      </TableCell>
      <TableCell>{device.IsEnabled ? 'Yes' : 'No'}</TableCell>
      <TableCell>{new Date(device.Created).toLocaleString()}</TableCell>
      <TableCell>{new Date(device.Updated).toLocaleString()}</TableCell>
    </TableRow>
  );
}

function PlatformRow({
  platform,
  onDeviceClick,
}: {
  platform: Platform;
  onDeviceClick: (device: Device) => void;
}) {
  const [open, setOpen] = useState(false);
  const lightBlue = '#90CAF9';

  return (
    <>
      <TableRow
        hover
        sx={{ bgcolor: '#263238', cursor: 'pointer' }}
        onClick={() => setOpen(!open)}
        tabIndex={0}
        aria-expanded={open}
        aria-label="expand platform row"
      >
        <TableCell>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open);
            }}
            sx={{ color: lightBlue }}
            aria-label={open ? 'Collapse devices' : 'Expand devices'}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ fontWeight: 'bold', color: lightBlue }}>{platform.PlatformNumber || 'N/A'}</TableCell>
        <TableCell sx={{ color: lightBlue }}>{platform.PlatformType || 'N/A'}</TableCell>
        <TableCell sx={{ color: lightBlue }}>{platform.Description || 'N/A'}</TableCell>
        <TableCell sx={{ color: lightBlue }}>{platform.Subnet || 'N/A'}</TableCell>
        <TableCell colSpan={3} />
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            {(!platform.Devices || platform.Devices.length === 0) ? (
              <Typography sx={{ m: 2, color: lightBlue, fontStyle: 'italic' }}>
                No devices found.
              </Typography>
            ) : (
              <Table size="small" sx={{ bgcolor: '#37474f', borderRadius: 1, m: 1 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: lightBlue }}>ID</TableCell>
                    <TableCell sx={{ color: lightBlue }}>Type</TableCell>
                    <TableCell sx={{ color: lightBlue }}>Description</TableCell>
                    <TableCell sx={{ color: lightBlue }}>IP Address</TableCell>
                    <TableCell sx={{ color: lightBlue }}>Status</TableCell>
                    <TableCell sx={{ color: lightBlue }}>Enabled</TableCell>
                    <TableCell sx={{ color: lightBlue }}>Created</TableCell>
                    <TableCell sx={{ color: lightBlue }}>Updated</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {platform.Devices.map((device) => (
                    <DeviceRow key={device.Id} device={device} onDeviceClick={onDeviceClick} />
                  ))}
                </TableBody>
              </Table>
            )}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

interface PlatformSortFilterProps {
  platforms: Platform[];
  onDeviceClick: (device: Device) => void;
}

function PlatformsTable({ platforms, onDeviceClick }: PlatformSortFilterProps) {
  const lightBlue = '#90CAF9';

  // Sorting state
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof Platform>('PlatformNumber');

  // Filter state
  const [filterText, setFilterText] = useState('');

  const handleRequestSort = (property: keyof Platform) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Filter platforms by filterText (on PlatformNumber, PlatformType, Description, Subnet)
  const filteredPlatforms = useMemo(() => {
    return platforms.filter((p) => {
      const search = filterText.toLowerCase();
      return (
        (p.PlatformNumber?.toLowerCase().includes(search) ?? false) ||
        (p.PlatformType?.toLowerCase().includes(search) ?? false) ||
        (p.Description?.toLowerCase().includes(search) ?? false) ||
        (p.Subnet?.toLowerCase().includes(search) ?? false)
      );
    });
  }, [platforms, filterText]);

  // Sort filtered platforms
  const sortedPlatforms = useMemo(() => {
    return stableSort(filteredPlatforms, getComparator(order, orderBy));
  }, [filteredPlatforms, order, orderBy]);

  return (
    <>
      <Box
        sx={{
          mb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <TextField
          label="Filter Platforms"
          variant="outlined"
          size="small"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          sx={{ maxWidth: 300, bgcolor: '#263238', borderRadius: 1, input: { color: lightBlue } }}
          InputLabelProps={{ sx: { color: lightBlue } }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ bgcolor: '#263238', borderRadius: 2 }}>
        <Table stickyHeader aria-label="platforms table">
          <TableHead>
            <TableRow>
              <TableCell />
              {[
                { id: 'PlatformNumber', label: 'Platform #' },
                { id: 'PlatformType', label: 'Type' },
                { id: 'Description', label: 'Description' },
                { id: 'Subnet', label: 'Subnet' },
              ].map((headCell) => (
                <TableCell
                  key={headCell.id}
                  sortDirection={orderBy === headCell.id ? order : false}
                  sx={{ color: lightBlue, fontWeight: 'bold' }}
                >
                  <TableSortLabel
                    active={orderBy === headCell.id}
                    direction={orderBy === headCell.id ? order : 'asc'}
                    onClick={() => handleRequestSort(headCell.id as keyof Platform)}
                    sx={{ color: lightBlue }}
                  >
                    {headCell.label}
                  </TableSortLabel>
                </TableCell>
              ))}
              <TableCell colSpan={3} />
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedPlatforms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ color: lightBlue }}>
                  No platforms match filter.
                </TableCell>
              </TableRow>
            ) : (
              sortedPlatforms.map((platform) => (
                <PlatformRow key={platform.PlatformNumber} platform={platform} onDeviceClick={onDeviceClick} />
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}

export default function PlatformsDevicesPage() {
  const lightBlue = '#90CAF9';
  const darkGrey = '#121212';

  const [latestStationData, setLatestStationData] = useState<LatestStationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  // Fetch API function - now gets only latest platforms
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/rms/platforms-devices', {
        headers: {
          'x-api-key': process.env.NEXT_PUBLIC_API_KEY || '',
        },
      });
      const json = await res.json();
      
      if (json.success && json.data) {
        setLatestStationData(json.data);
      } else {
        setLatestStationData(null);
        setError(json.message || 'No latest platform data found.');
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Server error while loading latest platform data.');
      setLatestStationData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle device click for dialog popup
  const handleDeviceClick = (device: Device) => {
    setSelectedDevice(device);
  };

  // Close device details dialog
  const handleCloseDeviceDialog = () => {
    setSelectedDevice(null);
  };

  return (
    <Template>
      <Box sx={{ p: 4, bgcolor: darkGrey, minHeight: '100vh' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: lightBlue }}>
            Latest Station Platforms & Devices
          </Typography>
          <Tooltip title="Refresh Latest Data">
            <IconButton
              onClick={fetchData}
              sx={{
                color: lightBlue,
                '&:hover': { bgcolor: '#90caf933' },
              }}
              aria-label="refresh latest data"
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Loading/Error/Empty */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress size={60} sx={{ color: lightBlue }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ bgcolor: darkGrey, color: lightBlue, fontWeight: 'bold' }}>
            {error}
          </Alert>
        ) : !latestStationData ? (
          <Alert severity="info" sx={{ bgcolor: darkGrey, color: lightBlue, fontWeight: 'bold' }}>
            No latest platform data found.
          </Alert>
        ) : (
          // Render latest station data
          <Box>
            <Typography
              variant="h5"
              sx={{ mb: 1, color: lightBlue, fontWeight: 'bold' }}
              tabIndex={0}
              aria-label={`Latest Station ${latestStationData.stationName}`}
            >
              {latestStationData.stationName || 'N/A'} ({latestStationData.stationCode || 'N/A'})
              <Typography variant="body2" sx={{ color: '#ccc', mt: 0.5 }}>
                Last Updated: {new Date(latestStationData.updatedAt || latestStationData.createdAt).toLocaleString()}
              </Typography>
            </Typography>

            <PlatformsTable 
              platforms={latestStationData.platforms || []} 
              onDeviceClick={handleDeviceClick} 
            />
          </Box>
        )}

        {/* Device Details Dialog */}
        <DeviceDetailsDialog device={selectedDevice} open={!!selectedDevice} onClose={handleCloseDeviceDialog} />
      </Box>
    </Template>
  );
}