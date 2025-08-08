'use client';

import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
  Tooltip,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Slide,
} from '@mui/material';
import { useState, useEffect, forwardRef } from 'react';
import { Add, Edit, Delete } from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';

interface Tenant {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
}

const initialForm: Omit<Tenant, 'id'> = {
  name: '',
  email: '',
  company: '',
  phone: '',
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    const localData = localStorage.getItem('tenants');
    if (localData) {
      setTenants(JSON.parse(localData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tenants', JSON.stringify(tenants));
  }, [tenants]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleDialogOpen = () => {
    setForm(initialForm);
    setEditId(null);
    setOpenDialog(true);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
  };

  const handleSave = () => {
    if (!form.name || !form.email || !form.company || !form.phone) return;

    if (editId) {
      setTenants((prev) =>
        prev.map((t) => (t.id === editId ? { id: editId, ...form } : t))
      );
    } else {
      const newTenant: Tenant = { id: Date.now().toString(), ...form };
      setTenants((prev) => [...prev, newTenant]);
    }
    setOpenDialog(false);
  };

  const handleEdit = (tenant: Tenant) => {
    setEditId(tenant.id);
    setForm({
      name: tenant.name,
      email: tenant.email,
      company: tenant.company,
      phone: tenant.phone,
    });
    setOpenDialog(true);
  };

  const handleDelete = (id: string) => {
    setTenants((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Tenants
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleDialogOpen}>
          Add Tenant
        </Button>
      </Grid>

      <TableContainer component={Paper} elevation={2} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tenants.map((tenant) => (
              <TableRow key={tenant.id} hover>
                <TableCell>{tenant.name}</TableCell>
                <TableCell>{tenant.email}</TableCell>
                <TableCell>{tenant.company}</TableCell>
                <TableCell>{tenant.phone}</TableCell>
                <TableCell align="center">
                  <Tooltip title="Edit">
                    <IconButton color="primary" onClick={() => handleEdit(tenant)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton color="error" onClick={() => handleDelete(tenant.id)}>
                      <Delete />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {tenants.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No tenants found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        TransitionComponent={Transition}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{editId ? 'Edit Tenant' : 'Add New Tenant'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                name="name"
                label="Full Name"
                value={form.name}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                name="email"
                label="Email Address"
                type="email"
                value={form.email}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                name="company"
                label="Company Name"
                value={form.company}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                name="phone"
                label="Phone Number"
                type="tel"
                value={form.phone}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!form.name || !form.email || !form.company || !form.phone}
          >
            {editId ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
