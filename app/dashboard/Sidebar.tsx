'use client';

import React from 'react';
import {
  Box,
  Divider,
  Typography,
  Toolbar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Home,
  Train,
  Settings,
  Assignment,
  Notifications,
} from '@mui/icons-material';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

const Sidebar = () => {
  const router = useRouter();
  const pathname = usePathname(); // To highlight active route
  const { user } = useUser();

  const menuItems = [
    { text: 'Dashboard', icon: <Home />, path: '/dashboard' },
    { text: 'Active Trains', icon: <Train />, path: '/rms/active-trains' },
    { text: 'Station Info', icon: <Settings />, path: '/rms/station-info' },
    { text: 'Logs', icon: <Assignment />, path: '/rms/activity-log' },
    { text: 'CAP Alerts', icon: <Notifications />, path: '/rms/cap-alerts' },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <Box
      sx={{
        width: 250,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#1A252F',
        color: '#E0E7FF',
        minHeight: '100vh',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar sx={{ height: '64px' }} />
      <Divider sx={{ bgcolor: '#3B4A5A', mb: 2 }} />
      <List sx={{ flexGrow: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <ListItem
              component="button"
              key={item.text}
              onClick={() => handleNavigation(item.path)}
              sx={{
                '&:hover': { bgcolor: '#2D3B4F', borderRadius: '4px' },
                py: 1.5,
                bgcolor: isActive ? '#2D3B4F' : 'inherit',
              }}
              aria-current={isActive ? 'page' : undefined}
            >
              <ListItemIcon sx={{ color: isActive ? '#00ED64' : '#A3BFFA' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                sx={{
                  fontSize: '1rem',
                  fontWeight: 500,
                  color: isActive ? '#00ED64' : 'inherit',
                }}
              />
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ p: 2, bgcolor: '#15202B', textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: '#A3BFFA', opacity: 0.8 }}>
          © {new Date().getFullYear()} TIC Kolkata
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;
