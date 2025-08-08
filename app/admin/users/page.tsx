'use client';

import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Edit, Delete, Visibility } from '@mui/icons-material';

// User Interface
interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  position: string;
  department: string;
}

// Dummy Data
const initialUsers: User[] = [
  {
    id: 1,
    name: 'Rahul Sharma',
    email: 'rahul@example.com',
    role: 'Admin',
    position: 'Team Lead',
    department: 'Engineering',
  },
  {
    id: 2,
    name: 'Ananya Singh',
    email: 'ananya@example.com',
    role: 'Moderator',
    position: 'HR Manager',
    department: 'Human Resources',
  },
  {
    id: 3,
    name: 'Deepak Verma',
    email: 'deepak@example.com',
    role: 'User',
    position: 'Intern',
    department: 'Marketing',
  },
  {
    id: 4,
    name: 'Simran Kaur',
    email: 'simran@example.com',
    role: 'User',
    position: 'Designer',
    department: 'Product',
  },
];

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);

  // Role badge colors
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'error';
      case 'Moderator':
        return 'secondary';
      default:
        return 'primary';
    }
  };

  // View Modal
  const handleView = (user: User) => {
    setSelectedUser(user);
    setViewDialogOpen(true);
  };

  // Edit Modal
  const handleEdit = (user: User) => {
    setEditedUser({ ...user });
    setEditDialogOpen(true);
  };

  // Delete Handler
  const handleDelete = (id: number) => {
    const filtered = users.filter((user) => user.id !== id);
    setUsers(filtered);
  };

  // Save Changes from Edit Modal
  const handleSave = () => {
    if (!editedUser) return;
    const updated = users.map((user) =>
      user.id === editedUser.id ? editedUser : user
    );
    setUsers(updated);
    setEditDialogOpen(false);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography variant="h4" fontWeight={600} gutterBottom>
        Manage Users
      </Typography>

      <Grid container spacing={3}>
        {users.map((user) => (
          <Grid item xs={12} sm={6} md={4} key={user.id}>
            <Card
              sx={{
                p: 2,
                borderRadius: 3,
                boxShadow: 3,
                transition: '0.3s',
                '&:hover': { boxShadow: 6 },
              }}
            >
              <CardContent>
                <Stack spacing={2} alignItems="center">
                  <Avatar sx={{ width: 64, height: 64, bgcolor: '#3f51b5' }}>
                    {user.name.charAt(0)}
                  </Avatar>
                  <Typography variant="h6">{user.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {user.email}
                  </Typography>
                  <Chip
                    label={user.role}
                    color={getRoleColor(user.role)}
                    variant="outlined"
                  />
                </Stack>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center' }}>
                <IconButton onClick={() => handleView(user)}>
                  <Visibility />
                </IconButton>
                <IconButton onClick={() => handleEdit(user)}>
                  <Edit />
                </IconButton>
                <IconButton onClick={() => handleDelete(user.id)}>
                  <Delete />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)}>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent dividers>
          {selectedUser && (
            <Stack spacing={2}>
              <Typography>
                <strong>Name:</strong> {selectedUser.name}
              </Typography>
              <Typography>
                <strong>Email:</strong> {selectedUser.email}
              </Typography>
              <Typography>
                <strong>Role:</strong> {selectedUser.role}
              </Typography>
              <Typography>
                <strong>Position:</strong> {selectedUser.position}
              </Typography>
              <Typography>
                <strong>Department:</strong> {selectedUser.department}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)}>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent dividers>
          {editedUser && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Name"
                value={editedUser.name}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, name: e.target.value })
                }
              />
              <TextField
                label="Email"
                value={editedUser.email}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, email: e.target.value })
                }
              />
              <TextField
                label="Role"
                value={editedUser.role}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, role: e.target.value })
                }
              />
              <TextField
                label="Position"
                value={editedUser.position}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, position: e.target.value })
                }
              />
              <TextField
                label="Department"
                value={editedUser.department}
                onChange={(e) =>
                  setEditedUser({ ...editedUser, department: e.target.value })
                }
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
