'use client';

import React from 'react';
import Link from 'next/link';
import { Box, List, ListItemButton, ListItemText, AppBar, Toolbar, Typography } from '@mui/material';

const theme = {
  sidebarBg: '#1e1e1e',
  background: '#121212',
  primaryColor: '#00ED64',
  textColor: '#fff',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.background }}>
      {/* Sidebar */}
      <Box
        component="nav"
        sx={{
          width: 240,
          backgroundColor: theme.sidebarBg,
          color: theme.textColor,
          display: 'flex',
          flexDirection: 'column',
          py: 3,
          px: 2,
        }}
      >
        <Typography variant="h5" sx={{ mb: 4, fontWeight: 'bold', textAlign: 'center' }}>
          Dashboard
        </Typography>

        <List>
          <ListItemButton component={Link} href="/dashboard" sx={{ color: theme.textColor }}>
            <ListItemText primary="Home" />
          </ListItemButton>

          <ListItemButton component={Link} href="/dashboard/profile" sx={{ color: theme.textColor }}>
            <ListItemText primary="Profile" />
          </ListItemButton>

          {/* Add more nav links here */}
        </List>
      </Box>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3, color: theme.textColor }}>
        {/* Optional: Top AppBar */}
        <AppBar position="static" sx={{ backgroundColor: theme.sidebarBg, mb: 3 }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Welcome to Dashboard
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Render the actual page content */}
        {children}
      </Box>
    </Box>
  );
}
