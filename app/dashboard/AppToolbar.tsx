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
  const [userProfile, setUserProfile] = useState<{ fullName?: string; image?: string } | null>(null);
  const router = useRouter();

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleMenuClose();
    if (!userProfile || !userProfile.fullName) {
      router.push('/profile-completion');
    } else {
      router.push('/profile-details');
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('email');
    router.push('/login');
  };

  useEffect(() => {
    const fetchUserProfile = async () => {
      const email = Cookies.get('email');
      if (email) {
        try {
          const res = await fetch(`/api/user-profile?email=${email}`);
          if (res.ok) {
            const data = await res.json();
            setUserProfile(data);
          }
        } catch (err) {
          console.error('Profile fetch error:', err);
        }
      }
    };
    fetchUserProfile();
  }, []);

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, backgroundColor: '#1B263B' }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" noWrap sx={{ flexGrow: 1, color: '#FFF' }}>
          IP-IPIS RMS
        </Typography>
        <IconButton color="inherit">
          <NotificationsIcon />
        </IconButton>
        <IconButton color="inherit">
          <MessageIcon />
        </IconButton>
        <IconButton color="inherit" onClick={handleMenuClick}>
          {userProfile?.image ? (
            <Avatar src={userProfile.image} sx={{ width: 24, height: 24 }} />
          ) : (
            <AccountCircleIcon />
          )}
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{ sx: { backgroundColor: '#1B263B', color: '#FFF' } }}
        >
          <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default AppToolbar;