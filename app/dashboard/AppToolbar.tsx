'use client';

import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Avatar,
  Box,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MessageIcon from '@mui/icons-material/Message';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

interface AppToolbarProps {
  handleDrawerToggle: () => void;
}

const AppToolbar: React.FC<AppToolbarProps> = ({ handleDrawerToggle }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  // Adjust type to your actual user profile shape:
  const [userProfile, setUserProfile] = useState<{ fullName?: string; imageUrl?: string } | null>(null);
  const router = useRouter();

  const palette = {
    background: '#0A1428',
    accent: '#00D4B8',
    textPrimary: '#FFFFFF',
    textSecondary: '#B0BEC5',
    border: 'rgba(0, 212, 184, 0.2)',
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    router.push('/profile-details');
  };

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('email');
    handleMenuClose();
    router.push('/login'); // Redirect explicitly on logout
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = Cookies.get('token');
      const email = Cookies.get('email');
      if (!token || !email) {
        setUserProfile(null);
        return;
      }

      try {
        const res = await fetch(`/api/user-profile?email=${encodeURIComponent(email)}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          setUserProfile(null);
          return;
        }

        const data = await res.json();
        // Your backend returns { success: true, users: [userProfile] }
        if (data.success && Array.isArray(data.users) && data.users.length > 0) {
          setUserProfile(data.users[0]);
        } else {
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
        setUserProfile(null);
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: palette.background,
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
      }}
    >
      <Toolbar
        sx={{
          minHeight: 28,
          px: 0.8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Left Section */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 0.4, color: palette.accent }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <img
            src="/logo.png"
            alt="RMS"
            style={{ height: 35, width: 'auto', marginRight: 4 }}
          />
          <Typography
            variant="h6"
            noWrap
            sx={{
              color: palette.textPrimary,
              fontSize: '1.25rem',
              fontWeight: 700,
              fontFamily: '"Roboto Condensed", "Segoe UI", sans-serif',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            IP-IPIS REMOTE MONITORING SYSTEM
          </Typography>
        </Box>

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton color="inherit" sx={{ color: palette.textSecondary, p: 0.2 }}>
            <NotificationsIcon fontSize="small" />
          </IconButton>
          <IconButton color="inherit" sx={{ color: palette.textSecondary, p: 0.2 }}>
            <MessageIcon fontSize="small" />
          </IconButton>
          <IconButton color="inherit" onClick={handleMenuClick} sx={{ p: 0.2 }}>
            {userProfile?.imageUrl ? (
              <Avatar src={userProfile.imageUrl} sx={{ width: 16, height: 16 }} />
            ) : (
              <AccountCircleIcon sx={{ color: palette.accent }} fontSize="small" />
            )}
          </IconButton>
        </Box>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            sx: {
              backgroundColor: palette.background,
              color: palette.textPrimary,
              border: `1px solid ${palette.border}`,
            },
          }}
        >
          <MenuItem
            onClick={handleProfileClick}
            sx={{
              '&:hover': { bgcolor: 'rgba(0, 212, 184, 0.15)' },
              fontSize: '0.75rem',
              py: 0.5,
            }}
          >
            Profile
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            sx={{
              '&:hover': { bgcolor: 'rgba(0, 212, 184, 0.15)' },
              fontSize: '0.75rem',
              py: 0.5,
            }}
          >
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default AppToolbar;
