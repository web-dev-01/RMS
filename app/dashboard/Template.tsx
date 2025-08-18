'use client';

import React, { useState } from 'react';
import { Drawer, CssBaseline, Box, Toolbar } from '@mui/material';
import AppToolbar from './AppToolbar';
import AppFooter from './AppFooter';
import Sidebar from './Sidebar';
import { useUser } from '@/contexts/UserContext';

const drawerWidth = 220;

interface TemplateProps {
  children: React.ReactNode;
}

const Template: React.FC<TemplateProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, loading } = useUser();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <AppToolbar handleDrawerToggle={handleDrawerToggle} />
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Sidebar Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              overflowY: 'scroll',

              /* 🔹 Hide scrollbar visually but keep scrolling functional */
              scrollbarWidth: 'none', // Firefox
              '&::-webkit-scrollbar': {
                display: 'none', // Chrome, Safari, Edge
              },
            },
          }}
        >
          <Sidebar user={user} />
        </Drawer>

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
            width: { sm: `calc(100% - ${drawerWidth}px)` },
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Toolbar />
          {children}
        </Box>
      </Box>
      <AppFooter />
    </Box>
  );
};

export default Template;
