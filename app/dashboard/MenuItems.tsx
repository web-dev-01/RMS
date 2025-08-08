// src/components/MenuItems.js
'use client';

import React, { useState } from 'react';
import {
  List,Typography,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SettingsIcon from '@mui/icons-material/Settings';
import EventNoteIcon from '@mui/icons-material/EventNote';
import BuildIcon from '@mui/icons-material/Build';
import EmergencyIcon from '@mui/icons-material/Warning';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import { useUser } from '@/contexts/UserContext';
import { ListItemButton } from '@mui/material';

import Link from 'next/link';

const MenuItems = () => {
  const { user } = useUser();

  const [openSettings, setOpenSettings] = useState(false);
  const [openAdmin, setOpenAdmin] = useState(false);

  const toggleSettings = () => {
    setOpenSettings((prev) => !prev);
  };

  const toggleAdmin = () => {
    setOpenAdmin((prev) => !prev);
  };

  return (
    <List>
      {/* Dashboard - Uncomment if needed */}
      {/* <Link href="/dashboard" passHref>
        <ListItem button component="a">
          <ListItemIcon><DashboardIcon /></ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
      </Link> */}

     

<Link href="/rms/station-info">
  <ListItemButton>
    <ListItemIcon><BuildIcon /></ListItemIcon>
    <ListItemText primary="Station Info" />
  </ListItemButton>
</Link>


      <Link href="/rms/platforms-devices" passHref>
        <ListItem button component="a">
          <ListItemIcon><BuildIcon /></ListItemIcon>
          <ListItemText primary="Platforms-Devices" />
        </ListItem>
      </Link>

      <Link href="/rms/cap-alerts" passHref>
        <ListItem button component="a">
          <ListItemIcon><EmergencyIcon /></ListItemIcon>
          <ListItemText primary="CAP Alerts" />
        </ListItem>
      </Link>

      <Link href="/rms/event-logs" passHref>
        <ListItem button component="a">
          <ListItemIcon><EventNoteIcon /></ListItemIcon>
          <ListItemText primary="Event Logs" />
        </ListItem>
      </Link>

      {/* Settings */}
      <ListItem button onClick={toggleSettings}>
        <ListItemIcon><SettingsIcon /></ListItemIcon>
        <ListItemText primary="Settings" />
        {openSettings ? <ExpandLess /> : <ExpandMore />}
      </ListItem>
      <Collapse in={openSettings} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {user?.role === 'admin' && (
            <Link href="/rms/settings" passHref>
              <ListItem button component="a" sx={{ pl: 4 }}>
                <ListItemIcon><SettingsIcon /></ListItemIcon>
                <ListItemText primary="RMS Settings" />
              </ListItem>
            </Link>
          )}
          <Link href="/profile" passHref>
            <ListItem button component="a" sx={{ pl: 4 }}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="User Profile" />
            </ListItem>
          </Link>
        </List>
      </Collapse>

      {/* Admin Section */}
      {user?.role === 'admin' && (
        <>
          <ListItem button onClick={toggleAdmin}>
            <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
            <ListItemText primary="Admin" />
            {openAdmin ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openAdmin} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <Link href="/admin/users" passHref>
                <ListItem button component="a" sx={{ pl: 4 }}>
                  <ListItemText primary="User Management" />
                </ListItem>
              </Link>
            </List>
          </Collapse>
        </>
      )}
    </List>
  );
};

export default MenuItems;
