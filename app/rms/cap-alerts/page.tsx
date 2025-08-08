'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
  Chip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import axios from 'axios';

interface CapAlert {
  _id: string;
  identifier: string;
  sender: string;
  sent: string;
  status: string;
  msgType: string;
  scope: string;
  source?: string;
  restriction?: string;
  addresses?: string;
  code?: string[];
  note?: string;
  references?: string;
  info: CapAlertInfo[];
  createdAt: string;
}

interface CapAlertInfo {
  language?: string;
  category?: string[];
  event: string;
  urgency: string;
  severity: string;
  certainty: string;
  audience?: string;
  eventCode?: { valueName: string; value: string }[];
  effective?: string;
  onset?: string;
  expires?: string;
  senderName?: string;
  headline?: string;
  description?: string;
  instruction?: string;
  web?: string;
  contact?: string;
  parameter?: { valueName: string; value: string }[];
  area?: { areaDesc: string; polygon?: string[]; circle?: string[] }[];
}

export default function CapAlertsPage() {
  const [alerts, setAlerts] = useState<CapAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<CapAlert | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await axios.get('/api/rms/cap-alerts');
        setAlerts(res.data.alerts || []);
      } catch (error) {
        console.error('Error fetching alerts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAlerts();
  }, []);

  const handleRowClick = (params: any) => {
    setSelectedAlert(params.row);
    setOpen(true);
  };

  const columns: GridColDef[] = [
    { field: 'identifier', headerName: 'Identifier', flex: 1 },
    { field: 'sender', headerName: 'Sender', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 0.6 },
    { field: 'msgType', headerName: 'Type', flex: 0.6 },
    { field: 'scope', headerName: 'Scope', flex: 0.6 },
    {
      field: 'createdAt',
      headerName: 'Created At',
      flex: 1,
      valueGetter: (params) => new Date(params.value).toLocaleString(),
    },
  ];

  return (
    <Box sx={{ p: 4, bgcolor: '#101111', minHeight: '100vh' }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        CAP Alerts
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        Read-only dashboard of all CAP alerts from RMS system
      </Typography>

      <Paper elevation={2} sx={{ mt: 3, p: 2 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" p={5}>
            <CircularProgress />
          </Box>
        ) : (
          <Box height={550}>
            <DataGrid
              rows={alerts}
              getRowId={(row) => row._id}
              columns={columns}
              pageSize={8}
              onRowClick={handleRowClick}
              disableRowSelectionOnClick
            />
          </Box>
        )}
      </Paper>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>CAP Alert Details</DialogTitle>
        <DialogContent dividers>
          {selectedAlert ? (
            <>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={6}>
                  <Typography><strong>Identifier:</strong> {selectedAlert.identifier}</Typography>
                  <Typography><strong>Sender:</strong> {selectedAlert.sender}</Typography>
                  <Typography><strong>Sent:</strong> {selectedAlert.sent}</Typography>
                  <Typography><strong>Status:</strong> {selectedAlert.status}</Typography>
                  <Typography><strong>Scope:</strong> {selectedAlert.scope}</Typography>
                  <Typography><strong>Source:</strong> {selectedAlert.source || '-'}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography><strong>MsgType:</strong> {selectedAlert.msgType}</Typography>
                  <Typography><strong>Restriction:</strong> {selectedAlert.restriction || '-'}</Typography>
                  <Typography><strong>Addresses:</strong> {selectedAlert.addresses || '-'}</Typography>
                  <Typography><strong>Code:</strong> {selectedAlert.code?.join(', ') || '-'}</Typography>
                  <Typography><strong>Note:</strong> {selectedAlert.note || '-'}</Typography>
                  <Typography><strong>References:</strong> {selectedAlert.references || '-'}</Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>Information Blocks</Typography>

              {selectedAlert.info?.map((info, idx) => (
                <Paper key={idx} sx={{ my: 2, p: 2, backgroundColor: '#01070d' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography><strong>Event:</strong> {info.event}</Typography>
                      <Typography><strong>Urgency:</strong> {info.urgency}</Typography>
                      <Typography><strong>Severity:</strong> {info.severity}</Typography>
                      <Typography><strong>Certainty:</strong> {info.certainty}</Typography>
                      <Typography><strong>Audience:</strong> {info.audience || '-'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography><strong>Headline:</strong> {info.headline}</Typography>
                      <Typography><strong>Description:</strong> {info.description}</Typography>
                      <Typography><strong>Web:</strong> {info.web || '-'}</Typography>
                      <Typography><strong>Contact:</strong> {info.contact || '-'}</Typography>
                    </Grid>
                  </Grid>

                  {info.eventCode?.length > 0 && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle2">Event Codes</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {info.eventCode.map((ec, i) => (
                          <Chip key={i} label={`${ec.valueName}: ${ec.value}`} />
                        ))}
                      </Box>
                    </>
                  )}

                  {info.parameter?.length > 0 && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle2">Parameters</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                        {info.parameter.map((param, i) => (
                          <Chip key={i} label={`${param.valueName}: ${param.value}`} />
                        ))}
                      </Box>
                    </>
                  )}

                  {info.area?.length > 0 && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="subtitle2">Area</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                        {info.area.map((area, i) => (
                          <Typography key={i}>• {area.areaDesc}</Typography>
                        ))}
                      </Box>
                    </>
                  )}
                </Paper>
              ))}
            </>
          ) : (
            <Typography>No alert selected.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
