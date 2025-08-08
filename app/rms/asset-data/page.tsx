'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  TextField,
  MenuItem,
  Grid,
  Divider,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';

interface AssetData {
  id: number;
  assetName: string;
  type: string;
  timestamp: string;
  status: string;
  temperature: string;
  voltage: string;
}

const mockData: AssetData[] = [
  {
    id: 1,
    assetName: 'Router A',
    type: 'Router',
    timestamp: '2025-08-04 10:15:00',
    status: 'Online',
    temperature: '45°C',
    voltage: '12V',
  },
  {
    id: 2,
    assetName: 'Switch B',
    type: 'Switch',
    timestamp: '2025-08-04 10:10:00',
    status: 'Offline',
    temperature: 'N/A',
    voltage: 'N/A',
  },
  {
    id: 3,
    assetName: 'Camera C',
    type: 'Camera',
    timestamp: '2025-08-04 10:05:00',
    status: 'Online',
    temperature: '38°C',
    voltage: '5V',
  },
];

export default function AssetDataPage() {
  const [data, setData] = useState<AssetData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setTimeout(() => {
      setData(mockData); // Replace with actual fetch in production
      setLoading(false);
    }, 1000);
  }, []);

  const filteredData = data.filter((item) => {
    const matchesType = filterType ? item.type === filterType : true;
    const matchesSearch = item.assetName
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Asset Telemetry Data
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Live and historical telemetry for critical assets.
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Search by Asset Name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                label="Filter by Type"
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Router">Router</MenuItem>
                <MenuItem value="Switch">Switch</MenuItem>
                <MenuItem value="Camera">Camera</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <CircularProgress />
          </div>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Asset Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Temperature</TableCell>
                <TableCell>Voltage</TableCell>
                <TableCell>Last Updated</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.assetName}</TableCell>
                  <TableCell>{row.type}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.temperature}</TableCell>
                  <TableCell>{row.voltage}</TableCell>
                  <TableCell>{row.timestamp}</TableCell>
                </TableRow>
              ))}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No matching records found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Container>
  );
}
